// TaxVideoConvert - Main Process (sağlamlaştırılmış sürüm)
// - Menü gizli
// - ffmpeg-static ve yt-dlp, asar.unpacked veya resources/bin altından çalıştırılır
// - Yerel proxy (CORS + Range)
// - yt-dlp: bilgi/indirme, ffmpeg: trim + encode/mux
// - Renderer ile IPC

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const express = require('express');
const http = require('http');
const https = require('https');
const urlLib = require('url');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

const ffmpegLib = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ytDlp = require('yt-dlp-exec');

const isDev = !app.isPackaged;

// ----------------------------- Yardımcılar -----------------------------
function unpackedPath(p) {
  if (!p) return p;
  return p.replace(/app\.asar([/\\]?)/, 'app.asar.unpacked$1');
}
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

// ffmpeg yolunu asar.unpacked’a çevir ve ayarla
ffmpegLib.setFfmpegPath(unpackedPath(ffmpegStatic));

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
async function startProxy() {
  const exapp = express();

  exapp.get('/proxy', (req, res) => {
    const target = req.query.url;
    if (!target) return res.status(400).send('Missing url');

    const headers = {};
    if (req.headers['range']) headers['Range'] = req.headers['range'];
    headers['User-Agent'] = req.headers['user-agent'] || 'Mozilla/5.0 (Electron)';
    headers['Referer'] = 'https://www.youtube.com/';

    const parsed = urlLib.parse(target);
    const client = parsed.protocol === 'https:' ? https : http;

    const proxReq = client.get(target, { headers }, proxRes => {
      res.writeHead(proxRes.statusCode || 200, {
        ...proxRes.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length, Content-Type'
      });
      proxRes.pipe(res);
    });

    proxReq.on('error', (err) => {
      console.error('Proxy error:', err);
      if (!res.headersSent) res.status(502).send('Proxy error');
    });
  });

  return new Promise((resolve) => {
    const server = exapp.listen(0, () => {
      const { port } = server.address();
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
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function setupUpdaterEvents() {
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
  try {
    const result = await autoUpdater.checkForUpdates();
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('downloadUpdate', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('installUpdate', () => {
  autoUpdater.quitAndInstall(false, true);
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
  if (!isDev) {
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
ipcMain.handle('fetchVideoInfo', async (event, url) => {
  const wcId = event.sender.id;
  try {
    const info = await ytdlpExec(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: false
    });

    const formats = info.formats || [];
    const progressive = formats
      .filter(f => f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none' && f.url)
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    const previewFormat = progressive[0] || null;
    const previewUrl = previewFormat ? `http://127.0.0.1:${proxyPort}/proxy?url=${encodeURIComponent(previewFormat.url)}` : null;

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
    outPath
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

    // İndir (ayrı akışlarda olabilir)
    await ytdlpExec(url, {
      format: ytFormat,
      'no-warnings': true,
      'no-check-certificates': true,
      output: path.join(tempDir, 'dl.%(ext)s')
    });

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

    // FFmpeg komutu
    await new Promise((resolve, reject) => {
      const cmd = ffmpegLib();

      if (needVideo && videoFile) cmd.input(videoFile);
      if (needAudio && audioFile && audioFile !== videoFile) cmd.input(audioFile);
      if (!needVideo && audioFile && !videoFile) cmd.input(audioFile);

      const hasStart = typeof startSec === 'number' && startSec >= 0;
      const hasEnd = typeof endSec === 'number' && endSec > 0;

      if (hasStart) cmd.setStartTime(startSec);
      if (hasStart && hasEnd && endSec > startSec) cmd.setDuration(endSec - startSec);

      if (needVideo) {
        if (!videoCodec || videoCodec === 'copy') cmd.videoCodec('copy');
        else cmd.videoCodec(videoCodec);
      } else {
        cmd.noVideo();
      }

      if (needAudio) {
        if (!audioCodec || audioCodec === 'copy') cmd.audioCodec('copy');
        else cmd.audioCodec(audioCodec);
      } else {
        cmd.noAudio();
      }

      const ext = path.extname(outPath).slice(1).toLowerCase();
      if (ext) cmd.format(ext);
      else if (container) cmd.format(container);

      // Yeniden kodlamalarda varsayılanlar
      if (videoCodec && videoCodec !== 'copy') {
        if (videoCodec.includes('x264') || videoCodec === 'h264') cmd.outputOptions(['-crf 18', '-preset veryfast']);
        if (videoCodec.includes('x265') || videoCodec === 'hevc') cmd.outputOptions(['-crf 24', '-preset medium']);
        if (videoCodec === 'libvpx-vp9') cmd.outputOptions(['-b:v 0', '-crf 28']);
        if (videoCodec === 'libaom-av1' || videoCodec === 'av1') cmd.outputOptions(['-crf 28', '-b:v 0']);
        if (videoCodec === 'prores_ks') cmd.outputOptions(['-profile:v 3']);
      }
      if (audioCodec && audioCodec !== 'copy') {
        if (audioCodec === 'aac') cmd.audioBitrate('192k');
        if (audioCodec === 'libopus') cmd.audioBitrate('160k');
        if (audioCodec === 'libmp3lame') cmd.audioBitrate('192k');
      }

      const bw = BrowserWindow.fromWebContents(event.sender);
      cmd.on('progress', p => {
        bw.webContents.send('exportProgress', {
          frames: p.frames,
          currentKbps: p.currentKbps,
          targetSize: p.targetSize,
          timemark: p.timemark
        });
      });
      cmd.on('error', (err, stdout, stderr) => {
        console.error('ffmpeg error', err, stderr);
        reject(err);
      });
      cmd.on('end', () => resolve());

      cmd.save(outPath);
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

// ----------------------------- IPC: Varsayılan Belgeler Yolu -----------------------------
ipcMain.handle('getDefaultDocumentsPath', async () => {
  const documentsPath = app.getPath('documents');
  return { ok: true, path: documentsPath };
});