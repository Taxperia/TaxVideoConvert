// TaxVideoConvert - Main Process (sağlamlaştırılmış sürüm)
// - Menü gizli
// - ffmpeg-static ve yt-dlp, asar.unpacked veya resources/bin altından çalıştırılır
// - Yerel proxy (CORS + Range)
// - yt-dlp: bilgi/indirme, ffmpeg: trim + encode/mux
// - Renderer ile IPC

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const express = require('express');
const http = require('http');
const https = require('https');
const urlLib = require('url');
const dns = require('dns');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');
const packageJson = require(path.join(__dirname, "package.json"));

// electron-updater'ı güvenli şekilde yükle
let autoUpdater = null;
try {
  autoUpdater = require('electron-updater').autoUpdater;
} catch (err) {
  console.warn('[Updater] electron-updater yüklenemedi:', err.message);
}

const ffmpegLib = require('fluent-ffmpeg');
// ffmpeg-static yerine vendor/ffmpeg kullanıyoruz (daha stabil)
let ffmpegStatic = null;
try {
  ffmpegStatic = require('ffmpeg-static');
} catch (e) {
  // ffmpeg-static yoksa sorun değil, vendor kullanacağız
}
const ytDlp = require('yt-dlp-exec');

const isDev = !app.isPackaged;

// ----------------------------- Yardımcılar -----------------------------
function unpackedPath(p) {
  if (!p) return p;
  return p.replace(/app\.asar([/\\]?)/, 'app.asar.unpacked$1');
}


// Resmi ffmpeg binary'sini çözümle
function resolveFfmpegBinary() {
  const isWin = process.platform === 'win32';
  const exe = isWin ? 'ffmpeg.exe' : 'ffmpeg';
  const candidates = [];

  // 1) vendor/ffmpeg klasöründen (öncelikli - resmi build)
  candidates.push(path.join(__dirname, 'vendor', 'ffmpeg', exe));
  
  // 2) Paketlenmiş uygulamada resources altından
  if (process.resourcesPath) {
    candidates.push(path.join(process.resourcesPath, 'vendor', 'ffmpeg', exe));
    candidates.push(path.join(process.resourcesPath, 'app.asar.unpacked', 'vendor', 'ffmpeg', exe));
  }

  // 3) ffmpeg-static modülünden (fallback)
  if (ffmpegStatic) {
    candidates.push(unpackedPath(ffmpegStatic));
  }

  for (const p of candidates) {
    try { 
      if (p && fs.existsSync(p)) {
        console.log('[FFmpeg] Using:', p);
        return p; 
      }
    } catch (_) {}
  }
  
  // PATH'ten ffmpeg kullanılabilir
  console.log('[FFmpeg] Using system PATH');
  return 'ffmpeg';
}

// ffmpeg yolunu ayarla
const ffmpegPath = resolveFfmpegBinary();
ffmpegLib.setFfmpegPath(ffmpegPath);
function tmpFile(ext = '') {
  const name = `tvc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext ? '.' + ext.replace(/^\./, '') : ''}`;
  return path.join(os.tmpdir(), name);
}
function buildYtDlpFormatSelection({ height, videoOnly, audioOnly }) {
  if (audioOnly) return 'bestaudio/best';
  if (videoOnly) {
    if (height) return `bestvideo[height=${height}]/bestvideo[height<=${height}]/bestvideo`;
    return 'bestvideo';
  }
  if (height) return `bestvideo[height=${height}]+bestaudio/bestvideo[height<=${height}]+bestaudio/best`;
  return 'bestvideo+bestaudio/best';
}


// yt-dlp ikilisini çözümle (asar.unpacked / extraResources / dev node_modules / PATH)
function resolveYtDlpBinary() {
  const isWin = process.platform === 'win32';
  const exe = isWin ? 'yt-dlp.exe' : 'yt-dlp';
  const candidates = [];

  // 1) Modülün bildirdiği yolun unpacked hali
  const modulePath = ytDlp.path || ytDlp.getBinaryPath?.();
  if (modulePath) candidates.push(unpackedPath(modulePath));

  // 2) app.asar.unpacked/node_modules/... (paketli)
  const resPath = process.resourcesPath; // .../resources
  const unpackedRoot = path.join(resPath, 'app.asar.unpacked');
  candidates.push(
    path.join(unpackedRoot, 'node_modules', 'yt-dlp-exec', 'bin', exe),
    path.join(unpackedRoot, 'node_modules', 'yt-dlp-exec', exe)
  );

  // 3) extraResources ile kopyalanmışsa (opsiyonel öneri)
  candidates.push(
    path.join(resPath, 'bin', 'yt-dlp', exe),
    path.join(resPath, 'bin', exe)
  );

  // 4) Geliştirme (kaynak) dizini
  candidates.push(
    path.join(__dirname, 'node_modules', 'yt-dlp-exec', 'bin', exe),
    path.join(__dirname, 'node_modules', 'yt-dlp-exec', exe)
  );

  for (const p of candidates) {
    try { if (p && fs.existsSync(p)) return p; } catch (_) {}
  }
  return null; // PATH fallback kullanılabilir
}

let ytdlpExec = null;
const ytdlpBin = resolveYtDlpBinary();
if (ytdlpBin && typeof ytDlp.create === 'function') {
  ytdlpExec = ytDlp.create(ytdlpBin);
} else {
  // Fallback: paket "yt-dlp" komut adını PATH'ten denesin
  ytdlpExec = ytDlp;
}
if (isDev) {
  console.log('[TaxVideoConvert] yt-dlp binary:', ytdlpBin || '(PATH fallback)');
}

// ----------------------------- Proxy (CORS + Range) -----------------------------
async function isUrlSafe(targetUrl) {
  try {
    const parsed = urlLib.parse(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    
    const hostname = parsed.hostname;
    if (!hostname) return false;
    
    // Check known loopback/private patterns on hostname (before DNS)
    if (hostname.toLowerCase() === 'localhost') return false;
    if (hostname === '::1' || hostname === '[::1]') return false;
    if (hostname.startsWith('127.')) return false;
    if (hostname.startsWith('10.')) return false;
    if (hostname.startsWith('192.168.')) return false;
    if (hostname.startsWith('169.254.')) return false;
    // 172.16.x.x - 172.31.x.x
    const parts = hostname.split('.');
    if (parts.length === 4 && parts[0] === '172') {
        const second = parseInt(parts[1], 10);
        if (second >= 16 && second <= 31) return false;
    }
    
    // Resolve Hostname to IP to catch domains pointing to private IPs
    return new Promise((resolve) => {
        dns.lookup(hostname, { family: 4 }, (err, address) => {
            if (err) {
                // Determine if we should fail open or closed. Failing closed (reject) is safer.
                return resolve(false);
            }
            if (!address) return resolve(false);
            
            // Re-check resolved IP
            if (address.startsWith('127.')) return resolve(false);
            if (address.startsWith('10.')) return resolve(false);
            if (address.startsWith('192.168.')) return resolve(false);
            if (address.startsWith('169.254.')) return resolve(false);
            
            const ipParts = address.split('.');
            if (ipParts.length === 4 && ipParts[0] === '172') {
                const second = parseInt(ipParts[1], 10);
                if (second >= 16 && second <= 31) return resolve(false);
            }
            
            resolve(true);
        });
    });
  } catch (e) {
      return false;
  }
}

async function startProxy() {
  const exapp = express();

  exapp.get('/proxy', async (req, res) => {
    const target = req.query.url;
    if (!target) return res.status(400).send('Missing url');

    // SSRF Protection
    const safe = await isUrlSafe(target);
    if (!safe) {
        console.warn('[Proxy] Blocked unsafe URL:', target);
        return res.status(403).send('Forbidden: Access to private resources or invalid URL is denied.');
    }

    const headers = {};
    if (req.headers['range']) headers['Range'] = req.headers['range'];
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    headers['Referer'] = 'https://www.youtube.com/';
    headers['Origin'] = 'https://www.youtube.com';
    headers['Accept'] = '*/*';
    headers['Accept-Language'] = 'en-US,en;q=0.9';

    // Re-parse and validate URL to prevent SSRF
    let parsedUrl;
    try {
      parsedUrl = new URL(target);
    } catch (e) {
      console.warn('[Proxy] Invalid URL:', target, e.message);
      return res.status(400).send('Invalid url');
    }

    // Allow only http/https schemes
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      console.warn('[Proxy] Blocked non-http(s) URL:', parsedUrl.href);
      return res.status(403).send('Forbidden: Only http and https are allowed.');
    }

    const hostname = parsedUrl.hostname || '';

    // Basic private/loopback hostname checks
    const lowerHost = hostname.toLowerCase();
    const isLocalHostname =
      lowerHost === 'localhost' ||
      lowerHost === '127.0.0.1' ||
      lowerHost === '::1' ||
      lowerHost.endsWith('.local') ||
      lowerHost.endsWith('.localhost') ||
      lowerHost.endsWith('.lan');

    // Basic private IP checks (IPv4)
    const isPrivateIPv4 =
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      /^127\./.test(hostname) ||
      /^169\.254\./.test(hostname) ||
      /^0\.0\.0\.0$/.test(hostname);

    // Basic IPv6 local/unique-local checks
    const isPrivateIPv6 =
      /^::1$/.test(hostname) ||
      /^fc[0-9a-f]/i.test(hostname) || // unique local
      /^fd[0-9a-f]/i.test(hostname) || // unique local
      /^fe80:/i.test(hostname);       // link-local

    if (isLocalHostname || isPrivateIPv4 || isPrivateIPv6) {
      console.warn('[Proxy] Blocked private/internal URL:', parsedUrl.href);
      return res.status(403).send('Forbidden: Access to private/internal resources is denied.');
    }

    const client = parsedUrl.protocol === 'https:' ? https : http;

    console.log('[Proxy] Fetching:', parsedUrl.href.substring(0, 80) + '...');

    const proxReq = client.get(parsedUrl.href, { headers }, proxRes => {
      console.log('[Proxy] Response status:', proxRes.statusCode, 'Content-Type:', proxRes.headers['content-type']);
      
      // Content-Type'ı düzelt (video için)
      const contentType = proxRes.headers['content-type'] || 'video/mp4';
      
      // Response header'larını oluştur (undefined olanları filtrele)
      const responseHeaders = {
        'Content-Type': contentType,
        'Accept-Ranges': proxRes.headers['accept-ranges'] || 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length, Content-Type',
        'Cache-Control': 'no-cache'
      };
      
      // Opsiyonel header'ları sadece varsa ekle
      if (proxRes.headers['content-length']) {
        responseHeaders['Content-Length'] = proxRes.headers['content-length'];
      }
      if (proxRes.headers['content-range']) {
        responseHeaders['Content-Range'] = proxRes.headers['content-range'];
      }
      
      res.writeHead(proxRes.statusCode || 200, responseHeaders);
      proxRes.pipe(res);
    });

    proxReq.on('error', (err) => {
      console.error('[Proxy] Error:', err.message);
      if (!res.headersSent) res.status(502).send('Proxy error: ' + err.message);
    });

    req.on('close', () => {
      proxReq.destroy();
    });
  });

  return new Promise((resolve) => {
    const server = exapp.listen(0, () => {
      const { port } = server.address();
      console.log('[Proxy] Started on port', port);
      resolve({ server, port });
    });
  });
}

// ----------------------------- Pencere -----------------------------
let mainWindow = null;
let proxyServer = null;
let proxyPort = null;

function createMainWindow() {
  const bw = new BrowserWindow({
    width: 1100,
    height: 740,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  bw.removeMenu();
  Menu.setApplicationMenu(null);

  bw.on('closed', () => { mainWindow = null; });
  bw.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  if (isDev) bw.webContents.openDevTools({ mode: 'detach' });

  return bw;
}

// ----------------------------- Updater Ayarları -----------------------------
function setupUpdaterEvents() {
  if (!autoUpdater) return; // Updater yoksa çık
  
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    if (isDev) console.log('[Updater] Güncelleme kontrol ediliyor...');
  });

  autoUpdater.on('update-available', (info) => {
    if (isDev) console.log('[Updater] Güncelleme mevcut:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('updateAvailable', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    if (isDev) console.log('[Updater] Güncelleme yok, mevcut sürüm güncel.');
  });

  autoUpdater.on('download-progress', (progress) => {
    if (mainWindow) {
      mainWindow.webContents.send('updateProgress', {
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total,
        bytesPerSecond: progress.bytesPerSecond
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (isDev) console.log('[Updater] Güncelleme indirildi:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('updateDownloaded', {
        version: info.version
      });
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('[Updater] Hata:', err);
    if (mainWindow) {
      mainWindow.webContents.send('updateError', {
        message: err.message || String(err)
      });
    }
  });
}

// Updater IPC Handlers
ipcMain.handle('checkForUpdates', async () => {
  if (!autoUpdater) return { ok: false, error: 'Updater not available' };
  try {
    const result = await autoUpdater.checkForUpdates();
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('downloadUpdate', async () => {
  if (!autoUpdater) return { ok: false, error: 'Updater not available' };
  try {
    await autoUpdater.downloadUpdate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('installUpdate', () => {
  if (!autoUpdater) return;
  // Silent install - arka planda kurulum yapar, kurulum ekranı göstermez
  autoUpdater.quitAndInstall(true, true);
});

ipcMain.handle('getAppVersion', () => {
  return app.getVersion();
});

app.whenReady().then(async () => {
  const { server, port } = await startProxy();
  proxyServer = server;
  proxyPort = port;

  mainWindow = createMainWindow();
  
  // Updater olaylarını ayarla
  setupUpdaterEvents();
  
  // Uygulama başladıktan 3 saniye sonra güncelleme kontrol et (sadece paketli uygulamada)
  if (!isDev && autoUpdater) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(err => {
        console.error('[Updater] Kontrol hatası:', err);
      });
    }, 3000);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  if (proxyServer) proxyServer.close();
});

// ----------------------------- Oturum Durumu -----------------------------
const windowState = new Map(); // Map<webContentsId, { lastVideoInfo, lastVideoUrl }>

// ----------------------------- IPC: Video Bilgisi -----------------------------
ipcMain.handle('fetchVideoInfo', async (event, url, cookiesOptions) => {
  const wcId = event.sender.id;
  try {
    // yt-dlp seçenekleri
    const ytdlpOptions = {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: false
    };
    
    // Cookies desteği
    if (cookiesOptions) {
      if (cookiesOptions.cookiesFrom && cookiesOptions.cookiesFrom !== 'none') {
        if (cookiesOptions.cookiesFrom === 'file' && cookiesOptions.cookiesFilePath) {
          // cookies.txt dosyasından çerezleri kullan
          ytdlpOptions.cookies = cookiesOptions.cookiesFilePath;
        } else {
          // Tarayıcıdan çerezleri al (chrome, firefox, edge, brave, opera)
          ytdlpOptions.cookiesFromBrowser = cookiesOptions.cookiesFrom;
        }
      }
    }
    
    const info = await ytdlpExec(url, ytdlpOptions);

    const formats = info.formats || [];
    
    // Tarayıcıda oynatılabilir codec ve format kontrolü
    const isPlayableFormat = (f) => {
      if (!f.url || !f.vcodec || f.vcodec === 'none') return false;
      const vc = f.vcodec.toLowerCase();
      const ext = (f.ext || '').toLowerCase();
      
      // Sadece H.264/AVC codec'li MP4 formatları - en uyumlu
      const isH264 = vc.includes('avc') || vc.includes('h264');
      const isMp4 = ext === 'mp4' || ext === 'm4v';
      
      // VP9 WebM de denenebilir ama H264 MP4 daha güvenilir
      const isVp9Webm = (vc.includes('vp9') || vc.includes('vp09')) && ext === 'webm';
      
      return (isH264 && isMp4) || isVp9Webm;
    };
    
    // Önce progressive formatları dene (hem video hem ses)
    const progressive = formats
      .filter(f => isPlayableFormat(f) && f.acodec && f.acodec !== 'none')
      .sort((a, b) => {
        // H264 MP4'ü en üste al, sonra kaliteye göre sırala
        const aH264 = (a.vcodec?.toLowerCase().includes('avc')) ? 1000 : 0;
        const bH264 = (b.vcodec?.toLowerCase().includes('avc')) ? 1000 : 0;
        return (bH264 + (b.height || 0)) - (aH264 + (a.height || 0));
      });

    // Progressive yoksa video-only formatları dene
    const videoOnly = formats
      .filter(f => isPlayableFormat(f) && f.height && f.height <= 720)
      .sort((a, b) => {
        const aH264 = (a.vcodec?.toLowerCase().includes('avc')) ? 1000 : 0;
        const bH264 = (b.vcodec?.toLowerCase().includes('avc')) ? 1000 : 0;
        return (bH264 + (b.height || 0)) - (aH264 + (a.height || 0));
      });

    const previewFormat = progressive[0] || videoOnly[0] || null;
    const previewUrl = previewFormat ? `http://127.0.0.1:${proxyPort}/proxy?url=${encodeURIComponent(previewFormat.url)}` : null;
    
    console.log('[Preview] All formats count:', formats.length);
    console.log('[Preview] Progressive (playable) formats:', progressive.length);
    console.log('[Preview] Video-only (playable) formats:', videoOnly.length);
    if (previewFormat) {
      console.log('[Preview] Selected:', previewFormat.format_id, previewFormat.height + 'p', previewFormat.ext, 'vcodec:', previewFormat.vcodec, 'acodec:', previewFormat.acodec);
    } else {
      console.log('[Preview] No suitable format found! Available formats:');
      formats.slice(0, 10).forEach(f => {
        console.log(`  - ${f.format_id}: ${f.ext} ${f.height}p vcodec=${f.vcodec} acodec=${f.acodec}`);
      });
    }

    const slimFormats = formats.map(f => ({
      format_id: f.format_id,
      ext: f.ext,
      vcodec: f.vcodec,
      acodec: f.acodec,
      fps: f.fps,
      height: f.height,
      width: f.width,
      format_note: f.format_note,
      tbr: f.tbr,
      abr: f.abr,
      asr: f.asr,
      url: f.url || null,
      container: f.container || null
    }));

    const data = {
      id: info.id,
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      thumbnails: info.thumbnails,
      webpage_url: info.webpage_url || url,
      uploader: info.uploader,
      channel: info.channel,
      formats: slimFormats,
      preview: {
        url: previewUrl,
        format_id: previewFormat ? previewFormat.format_id : null,
        height: previewFormat ? previewFormat.height : null,
        ext: previewFormat ? previewFormat.ext : null
      }
    };

    windowState.set(wcId, { lastVideoInfo: data, lastVideoUrl: url });
    return { ok: true, data };
  } catch (err) {
    console.error('fetchVideoInfo error:', err);
    return { ok: false, error: String(err?.stderr || err?.message || err) };
  }
});

ipcMain.handle('getLastVideoInfo', (event) => {
  const wcId = event.sender.id;
  const s = windowState.get(wcId);
  if (!s || !s.lastVideoInfo) return { ok: false, error: 'Oturumda video bulunamadı.' };
  return { ok: true, data: s.lastVideoInfo };
});

ipcMain.handle('openEditorPage', async (event) => {
  const bw = BrowserWindow.fromWebContents(event.sender);
  await bw.loadFile(path.join(__dirname, 'renderer', 'editor.html'));
  return { ok: true };
});

ipcMain.handle('chooseOutputPath', async (event, { defaultName, extension, defaultPath }) => {
  const bw = BrowserWindow.fromWebContents(event.sender);
  const documentsPath = app.getPath('documents');
  const basePath = defaultPath || documentsPath;
  const fullDefaultPath = path.join(basePath, `${defaultName || 'output'}.${extension || 'mp4'}`);
  
  const { canceled, filePath } = await dialog.showSaveDialog(bw, {
    title: 'Çıkış dosyasını kaydet',
    defaultPath: fullDefaultPath,
    filters: [
      { name: 'Video/Audio', extensions: ['mp4', 'mkv', 'webm', 'mp3', 'm4a', 'wav', 'flac', 'ogg', 'mka'] },
      { name: 'Tümü', extensions: ['*'] }
    ]
  });
  if (canceled || !filePath) return { ok: false, canceled: true };
  return { ok: true, path: filePath };
});

// ----------------------------- IPC: Dışa Aktarım -----------------------------
ipcMain.handle('startExport', async (event, params) => {
  const {
    url,
    startSec,
    endSec,
    qualityHeight,
    container,
    videoCodec,
    audioCodec,
    mode,      // 'both' | 'video' | 'audio'
    outPath,
    cookiesFrom,      // Cookies kaynağı
    cookiesFilePath   // Cookies dosya yolu
  } = params;

  const needAudio = mode === 'both' || mode === 'audio';
  const needVideo = mode === 'both' || mode === 'video';

  const ytFormat = buildYtDlpFormatSelection({
    height: qualityHeight || null,
    videoOnly: mode === 'video',
    audioOnly: mode === 'audio'
  });

  let tempDir = null;

  try {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tvcjob_'));

    // yt-dlp indirme seçenekleri
    const ytdlpDownloadOptions = {
      format: ytFormat,
      'no-warnings': true,
      'no-check-certificates': true,
      output: path.join(tempDir, 'dl.%(ext)s')
    };
    
    // Cookies desteği
    if (cookiesFrom && cookiesFrom !== 'none') {
      if (cookiesFrom === 'file' && cookiesFilePath) {
        ytdlpDownloadOptions.cookies = cookiesFilePath;
      } else {
        ytdlpDownloadOptions.cookiesFromBrowser = cookiesFrom;
      }
    }

    // İndir (ayrı akışlarda olabilir)
    await ytdlpExec(url, ytdlpDownloadOptions);

    // Çıkan dosyaları belirle
    const files = fs.readdirSync(tempDir).map(f => path.join(tempDir, f));
    let videoFile = null;
    let audioFile = null;

    for (const f of files) {
      const ext = path.extname(f).slice(1).toLowerCase();
      if (['m4a', 'webm', 'opus', 'mp3', 'aac', 'wav', 'flac', 'ogg'].includes(ext)) {
        if (!audioFile) audioFile = f;
      } else if (['mp4', 'mkv', 'webm'].includes(ext)) {
        if (!videoFile) videoFile = f;
      }
    }
    if (needVideo && !videoFile && files.length > 0) videoFile = files[0];
    if (needAudio && !audioFile && files.length > 1) audioFile = files.find(f => f !== videoFile) || files[0];

    // FFmpeg komutu - doğrudan spawn ile çalıştır (daha stabil)
    await new Promise((resolve, reject) => {
      const args = [];
      
      // Input options
      args.push('-nostdin');
      args.push('-hide_banner');
      
      // Trim - input'tan önce (daha hızlı seek için)
      const hasStart = typeof startSec === 'number' && startSec >= 0;
      const hasEnd = typeof endSec === 'number' && endSec > 0;
      if (hasStart) {
        args.push('-ss', String(startSec));
      }
      
      // Inputs
      if (needVideo && videoFile) {
        args.push('-i', videoFile);
      }
      if (needAudio && audioFile && audioFile !== videoFile) {
        args.push('-i', audioFile);
      }
      if (!needVideo && audioFile && !videoFile) {
        args.push('-i', audioFile);
      }
      
      // Duration (input'tan sonra)
      if (hasStart && hasEnd && endSec > startSec) {
        args.push('-t', String(endSec - startSec));
      }
      
      // Video codec
      if (needVideo) {
        if (!videoCodec || videoCodec === 'copy') {
          args.push('-c:v', 'copy');
        } else {
          args.push('-c:v', videoCodec);
          // Codec-specific options
          if (videoCodec.includes('x264') || videoCodec === 'h264' || videoCodec === 'libx264') {
            args.push('-crf', '18', '-preset', 'veryfast');
          } else if (videoCodec.includes('x265') || videoCodec === 'hevc' || videoCodec === 'libx265') {
            args.push('-crf', '24', '-preset', 'medium');
          } else if (videoCodec === 'libvpx-vp9') {
            args.push('-b:v', '0', '-crf', '28', '-row-mt', '1');
          } else if (videoCodec === 'libaom-av1' || videoCodec === 'av1') {
            args.push('-crf', '28', '-b:v', '0');
          } else if (videoCodec === 'prores_ks') {
            args.push('-profile:v', '3');
          }
        }
      } else {
        args.push('-vn');
      }
      
      // Audio codec
      if (needAudio) {
        if (!audioCodec || audioCodec === 'copy') {
          args.push('-c:a', 'copy');
        } else {
          args.push('-c:a', audioCodec);
          if (audioCodec === 'aac') args.push('-b:a', '192k');
          if (audioCodec === 'libopus') args.push('-b:a', '160k');
          if (audioCodec === 'libmp3lame') args.push('-b:a', '192k');
        }
      } else {
        args.push('-an');
      }
      
      // Stabilite ayarları
      args.push('-max_muxing_queue_size', '16384');
      args.push('-threads', '4');  // Sabit thread sayısı
      
      // Output
      args.push('-y');  // Overwrite
      args.push('-progress', 'pipe:1');  // Progress to stdout
      args.push(outPath);
      
      console.log('[FFmpeg] Command:', ffmpegPath, args.join(' '));
      
      const ffmpegProcess = spawn(ffmpegPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],  // stdin kapalı
        windowsHide: true,
        detached: false
      });
      
      let lastProgress = {};
      const bw = BrowserWindow.fromWebContents(event.sender);
      
      // Progress parsing
      ffmpegProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('frame=')) lastProgress.frames = parseInt(line.split('=')[1]);
          if (line.startsWith('fps=')) lastProgress.fps = parseFloat(line.split('=')[1]);
          if (line.startsWith('out_time=')) lastProgress.timemark = line.split('=')[1].trim();
          if (line.startsWith('total_size=')) lastProgress.targetSize = parseInt(line.split('=')[1]);
          if (line.startsWith('speed=')) {
            // Her speed satırında progress gönder
            if (bw && !bw.isDestroyed()) {
              bw.webContents.send('exportProgress', {
                frames: lastProgress.frames,
                fps: lastProgress.fps,
                targetSize: lastProgress.targetSize,
                timemark: lastProgress.timemark
              });
            }
          }
        }
      });
      
      let stderrOutput = '';
      ffmpegProcess.stderr.on('data', (data) => {
        stderrOutput += data.toString();
        // Console'a son satırı yazdır (progress için)
        const lastLine = data.toString().trim().split('\n').pop();
        if (lastLine && lastLine.includes('frame=')) {
          process.stdout.write('\r' + lastLine);
        }
      });
      
      ffmpegProcess.on('error', (err) => {
        console.error('[FFmpeg] Process error:', err);
        reject(new Error(`FFmpeg process error: ${err.message}`));
      });
      
      ffmpegProcess.on('close', (code) => {
        console.log('\n[FFmpeg] Process exited with code:', code);
        if (code === 0) {
          resolve();
        } else {
          // Hata durumunda son 500 karakteri göster
          const errorTail = stderrOutput.slice(-500);
          reject(new Error(`ffmpeg exited with code ${code}: ${errorTail}`));
        }
      });
    });

    return { ok: true, outPath };
  } catch (err) {
    console.error('startExport error', err);
    return { ok: false, error: String(err?.message || err) };
  } finally {
    if (tempDir) {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
    }
  }
});

// ----------------------------- IPC: Dosyayı Klasörde Göster -----------------------------
ipcMain.handle('revealInFolder', async (event, filePath) => {
  try {
    await shell.showItemInFolder(filePath);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

// ----------------------------- IPC: Harici URL Aç -----------------------------
ipcMain.handle('openExternal', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

// ----------------------------- IPC: Klasör Seçimi -----------------------------
ipcMain.handle('chooseFolder', async (event) => {
  const bw = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(bw, {
    title: 'Klasör Seç',
    properties: ['openDirectory', 'createDirectory']
  });
  if (canceled || !filePaths || filePaths.length === 0) {
    return { ok: false, canceled: true };
  }
  return { ok: true, path: filePaths[0] };
});

// ----------------------------- IPC: Cookies Dosyası Seçimi -----------------------------
ipcMain.handle('chooseCookiesFile', async (event) => {
  const bw = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(bw, {
    title: 'cookies.txt Dosyası Seç',
    properties: ['openFile'],
    filters: [
      { name: 'Cookies File', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (canceled || !filePaths || filePaths.length === 0) {
    return { ok: false, canceled: true };
  }
  return { ok: true, path: filePaths[0] };
});

// ----------------------------- IPC: Varsayılan Belgeler Yolu -----------------------------
ipcMain.handle('getDefaultDocumentsPath', async () => {
  const documentsPath = app.getPath('documents');
  return { ok: true, path: documentsPath };
});