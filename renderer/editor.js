// Initialize theme
initTheme();

// Get App Version
window.api.getAppVersion().then(ver => {
  const vEl = document.getElementById('versionLabel');
  const appVerEl = document.getElementById('appVersionDisplay');
  if (vEl) vEl.textContent = ver;
  if (appVerEl) appVerEl.textContent = ver;
});

let videoInfo = null;
const player = document.getElementById('player');
const titleEl = document.getElementById('title');
const metaEl = document.getElementById('meta');
const qualitySel = document.getElementById('quality');
const containerSel = document.getElementById('container');
const vcodecSel = document.getElementById('vcodec');
const acodecSel = document.getElementById('acodec');
const modeSel = document.getElementById('mode');
const outBtn = document.getElementById('chooseOut');
const outPathEl = document.getElementById('outPath');
const exportBtn = document.getElementById('exportBtn');
const progressEl = document.getElementById('progress');
const doneEl = document.getElementById('done');

const timelineBar = document.getElementById('timelineBar');
const rangeEl = document.getElementById('range');
const handleStart = document.getElementById('handleStart');
const handleEnd = document.getElementById('handleEnd');
const startSecInput = document.getElementById('startSec');
const endSecInput = document.getElementById('endSec');
const setInBtn = document.getElementById('setIn');
const setOutBtn = document.getElementById('setOut');
const playInOutBtn = document.getElementById('playInOut');

// Settings Modal Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModalBtn = document.getElementById('closeModal');
const settingsNavItems = document.querySelectorAll('.settings-nav-item');
const settingsSections = document.querySelectorAll('.settings-section');
const languageSelect = document.getElementById('languageSelect');
const themeSelect = document.getElementById('themeSelect');
const defaultPathInput = document.getElementById('defaultPathInput');
const browsePathBtn = document.getElementById('browsePathBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const themePreviewBoxes = document.querySelectorAll('.theme-preview-box');

let duration = 0;
let startSec = 0;
let endSec = 0;
let outPath = '';

// Apply translations for editor
function applyEditorTranslations() {
  // Timeline labels
  document.getElementById('startLabel').childNodes[0].textContent = t('startSec') + ' ';
  document.getElementById('endLabel').childNodes[0].textContent = t('endSec') + ' ';
  document.getElementById('setIn').textContent = t('setIn');
  document.getElementById('setOut').textContent = t('setOut');
  if (!inOutLooping) {
    document.getElementById('playInOut').textContent = t('playInOut');
  }
  
  // Output settings
  document.getElementById('outputSettingsTitle').textContent = t('outputSettings');
  document.getElementById('modeLabel').childNodes[0].textContent = t('mode') + ' ';
  document.getElementById('modeBothOpt').textContent = t('modeBoth');
  document.getElementById('modeVideoOpt').textContent = t('modeVideo');
  document.getElementById('modeAudioOpt').textContent = t('modeAudio');
  document.getElementById('qualityLabel').childNodes[0].textContent = t('quality') + ' ';
  document.getElementById('qualityAutoOpt').textContent = t('qualityAuto');
  document.getElementById('containerLabel').childNodes[0].textContent = t('container') + ' ';
  document.getElementById('vcodecLabel').childNodes[0].textContent = t('videoCodec') + ' ';
  document.getElementById('acodecLabel').childNodes[0].textContent = t('audioCodec') + ' ';
  document.getElementById('vcodecCopyOpt').textContent = t('codecCopy');
  document.getElementById('acodecCopyOpt').textContent = t('codecCopy');
  document.querySelector('#chooseOut span').textContent = t('chooseOutPath');
  document.querySelector('#exportBtn span').textContent = t('exportBtn');
  
  // Settings Modal - new panel
  const generalTabBtn = document.getElementById('generalTabBtn');
  const appearanceTabBtn = document.getElementById('appearanceTabBtn');
  const aboutTabBtn = document.getElementById('aboutTabBtn');
  const languageLabel = document.getElementById('languageLabel');
  const themeLabel = document.getElementById('themeLabel');
  const defaultPathLabel = document.getElementById('defaultPathLabel');
  
  if (generalTabBtn) generalTabBtn.textContent = t('generalTab');
  if (appearanceTabBtn) appearanceTabBtn.textContent = t('appearanceTab') || 'Görünüm';
  if (aboutTabBtn) aboutTabBtn.textContent = t('aboutTab');
  if (languageLabel) languageLabel.textContent = t('language');
  if (themeLabel) themeLabel.textContent = t('theme');
  if (defaultPathLabel) defaultPathLabel.textContent = t('defaultPath');
  
  document.getElementById('themeDarkOpt').textContent = t('themeDark');
  document.getElementById('themeLightOpt').textContent = t('themeLight');
  document.getElementById('themeBlueOpt').textContent = t('themeBlue');
  document.getElementById('themePurpleOpt').textContent = t('themePurple');
  document.getElementById('aboutText').textContent = t('aboutText');
  document.getElementById('settingsBtn').title = t('settings');
}

// Load settings
function loadCurrentSettings() {
  const lang = localStorage.getItem('tvc_language') || 'tr';
  const theme = localStorage.getItem('tvc_theme') || 'dark';
  const defaultPath = localStorage.getItem('tvc_defaultPath') || '';
  
  languageSelect.value = lang;
  themeSelect.value = theme;
  defaultPathInput.value = defaultPath;
}

// Settings Modal handlers
settingsBtn.addEventListener('click', () => {
  loadCurrentSettings();
  settingsModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.style.display = 'none';
  }
});

// Tab switching - New settings panel
settingsNavItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    settingsNavItems.forEach(b => b.classList.remove('active'));
    settingsSections.forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    const targetSection = document.getElementById(tabName + 'Tab');
    if (targetSection) {
      targetSection.classList.add('active');
    }
  });
});

// Theme preview click
if (themePreviewBoxes) {
  themePreviewBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const theme = box.dataset.theme;
      themeSelect.value = theme;
      applyTheme(theme);
    });
  });
}

// Browse path
browsePathBtn.addEventListener('click', async () => {
  const result = await window.api.chooseFolder();
  if (result.ok && result.path) {
    defaultPathInput.value = result.path;
  }
});

// Save settings
saveSettingsBtn.addEventListener('click', () => {
  const lang = languageSelect.value;
  const theme = themeSelect.value;
  const defaultPath = defaultPathInput.value;
  
  localStorage.setItem('tvc_language', lang);
  localStorage.setItem('tvc_theme', theme);
  localStorage.setItem('tvc_defaultPath', defaultPath);
  
  applyTheme(theme);
  applyEditorTranslations();
  
  settingsModal.style.display = 'none';
});

// Theme change preview
themeSelect.addEventListener('change', () => {
  applyTheme(themeSelect.value);
});

function fmtTime(s) {
  const ss = Math.max(0, s|0);
  const h = Math.floor(ss / 3600);
  const m = Math.floor((ss % 3600) / 60);
  const sec = ss % 60;
  return (h > 0 ? `${h}:` : '') + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

function refreshRangeUI() {
  const w = timelineBar.clientWidth;
  if (!duration || !w) return;
  
  const startPct = Math.max(0, Math.min(1, startSec / duration));
  const endPct = Math.max(0, Math.min(1, endSec / duration));
  
  const handleWidth = 12;
  const usableWidth = w - handleWidth;
  
  const startLeft = startPct * usableWidth;
  const endLeft = endPct * usableWidth;
  
  rangeEl.style.left = `${startLeft + handleWidth/2}px`;
  rangeEl.style.width = `${Math.max(2, endLeft - startLeft)}px`;
  
  handleStart.style.left = `${startLeft}px`;
  handleEnd.style.left = `${endLeft}px`;
  
  startSecInput.value = startSec.toFixed(2);
  endSecInput.value = endSec.toFixed(2);
}

function setStartFromHandle(px) {
  const w = timelineBar.clientWidth;
  const handleWidth = 12;
  const usableWidth = w - handleWidth;
  const pct = Math.max(0, Math.min(1, px / usableWidth));
  startSec = Math.min(endSec - 0.1, pct * duration);
  startSec = Math.max(0, startSec);
  refreshRangeUI();
}

function setEndFromHandle(px) {
  const w = timelineBar.clientWidth;
  const handleWidth = 12;
  const usableWidth = w - handleWidth;
  const pct = Math.max(0, Math.min(1, px / usableWidth));
  endSec = Math.max(startSec + 0.1, pct * duration);
  endSec = Math.min(duration, endSec);
  refreshRangeUI();
}

function initDrag(handle, cb) {
  let dragging = false;

  handle.addEventListener('mousedown', (e) => {
    dragging = true;
    e.preventDefault();
    e.stopPropagation();
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = timelineBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    cb(x);
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
  });
}

// Click to set cursor or range endpoints
timelineBar.addEventListener('click', (e) => {
  const rect = timelineBar.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const w = timelineBar.clientWidth;
  const pct = Math.max(0, Math.min(1, x / w));
  const t = pct * duration;

  // If closer to start, move start; else end
  if (Math.abs(t - startSec) < Math.abs(t - endSec)) {
    startSec = Math.min(t, endSec);
  } else {
    endSec = Math.max(t, startSec);
  }
  refreshRangeUI();
});

initDrag(handleStart, setStartFromHandle);
initDrag(handleEnd, setEndFromHandle);

startSecInput.addEventListener('change', () => {
  const v = parseFloat(startSecInput.value) || 0;
  startSec = Math.max(0, Math.min(v, endSec));
  refreshRangeUI();
});
endSecInput.addEventListener('change', () => {
  const v = parseFloat(endSecInput.value) || 0;
  endSec = Math.max(startSec, Math.min(v, duration));
  refreshRangeUI();
});

setInBtn.addEventListener('click', () => {
  startSec = Math.min(player.currentTime || 0, endSec);
  refreshRangeUI();
});
setOutBtn.addEventListener('click', () => {
  endSec = Math.max(player.currentTime || 0, startSec);
  refreshRangeUI();
});

let inOutLooping = false;
playInOutBtn.addEventListener('click', () => {
  if (!inOutLooping) {
    player.currentTime = startSec;
    player.play();
    inOutLooping = true;
    playInOutBtn.textContent = t('stopPlay');
  } else {
    inOutLooping = false;
    player.pause();
    playInOutBtn.textContent = t('playInOut');
  }
});

player.addEventListener('timeupdate', () => {
  if (inOutLooping && endSec > startSec && player.currentTime >= endSec - 0.05) {
    player.currentTime = startSec;
    player.play();
  }
});

function suggestExtensionByModeContainer() {
  const mode = modeSel.value;
  const container = containerSel.value;
  if (mode === 'audio') {
    if (acodecSel.value === 'aac') return 'm4a';
    if (acodecSel.value === 'libmp3lame') return 'mp3';
    if (acodecSel.value === 'libopus') return 'ogg'; // could be .opus or .webm container; keep .ogg simple
    if (acodecSel.value === 'flac') return 'flac';
    if (acodecSel.value === 'pcm_s16le') return 'wav';
    return 'mka';
  }
  return container || 'mp4';
}

outBtn.addEventListener('click', async () => {
  const ext = suggestExtensionByModeContainer();
  const defName = (videoInfo?.title || 'output').replace(/[\\/:*?"<>|]+/g, '_');
  const defaultPath = localStorage.getItem('tvc_defaultPath') || '';
  const res = await window.api.chooseOutputPath({ defaultName: defName, extension: ext, defaultPath: defaultPath });
  if (res.ok) {
    outPath = res.path;
    outPathEl.textContent = outPath;
  }
});

exportBtn.addEventListener('click', async () => {
  if (!videoInfo) return;
  if (!outPath) {
    alert(t('selectOutputPath'));
    return;
  }
  doneEl.textContent = '';
  progressEl.textContent = t('processingStart');

  const height = qualitySel.value ? parseInt(qualitySel.value, 10) : null;

  const params = {
    url: videoInfo.webpage_url,
    startSec: startSec || 0,
    endSec: endSec && endSec > startSec ? endSec : null,
    qualityHeight: height,
    container: containerSel.value,
    videoCodec: modeSel.value === 'audio' ? null : vcodecSel.value,
    audioCodec: modeSel.value === 'video' ? null : acodecSel.value,
    mode: modeSel.value,
    outPath,
    // Cookies ayarları
    cookiesFrom: localStorage.getItem('tvc_cookiesFrom') || 'none',
    cookiesFilePath: localStorage.getItem('tvc_cookiesFilePath') || ''
  };

  try {
    const result = await window.api.startExport(params);
    if (!result.ok) {
      progressEl.textContent = '';
      doneEl.textContent = 'Hata: ' + (result.error || 'Bilinmeyen hata');
      return;
    }
    progressEl.textContent = '';
    doneEl.innerHTML = `${t('completed')}${result.outPath} <button id="reveal">${t('showInFolder')}</button>`;
    document.getElementById('reveal').addEventListener('click', async () => {
      await window.api.revealInFolder(result.outPath);
    });
  } catch (err) {
    progressEl.textContent = '';
    doneEl.textContent = t('error') + (err.message || err);
  }
});

// Progress
const detach = window.api.onExportProgress((p) => {
  const parts = [];
  if (p.timemark) parts.push(`${t('time')}: ${p.timemark}`);
  if (p.currentKbps) parts.push(`${t('speed')}: ${p.currentKbps} kb/s`);
  if (p.targetSize) parts.push(`${t('size')}: ${p.targetSize} kB`);
  progressEl.textContent = parts.join(' | ');
});

async function init() {
  const res = await window.api.getLastVideoInfo();
  if (!res.ok) {
    alert(t('noVideoInfo'));
    return;
  }
  videoInfo = res.data;
  titleEl.textContent = videoInfo.title || 'Video';
  const dur = Number(videoInfo.duration || 0);
  duration = isFinite(dur) ? dur : 0;
  startSec = 0;
  endSec = duration || 0;
  refreshRangeUI();

  metaEl.innerHTML = `
    ${t('duration')}: ${fmtTime(duration)}<br/>
    ${t('channel')}: ${videoInfo.uploader || videoInfo.channel || '-'}
  `;

  const thumbnailFallback = document.getElementById('thumbnailFallback');
  const thumbnailImg = document.getElementById('thumbnailImg');
  const thumbnailDuration = document.getElementById('thumbnailDuration');
  const openInBrowserBtn = document.getElementById('openInBrowserBtn');

  // Tarayıcıda aç butonu
  openInBrowserBtn.addEventListener('click', () => {
    if (videoInfo.webpage_url) {
      window.api.openExternal(videoInfo.webpage_url);
    }
  });

  // Thumbnail'i her zaman göster (en güvenilir yöntem)
  // Video önizleme çoğu platformda sorunlu olduğu için thumbnail tercih ediyoruz
  function showThumbnail() {
    player.style.display = 'none';
    if (videoInfo.thumbnail) {
      thumbnailImg.src = videoInfo.thumbnail;
      thumbnailDuration.textContent = fmtTime(duration);
      thumbnailFallback.style.display = 'block';
    }
  }

  // Önce video önizlemeyi dene
  if (videoInfo.preview?.url) {
    console.log('[Preview] Trying video preview...');
    player.src = videoInfo.preview.url;
    
    // 3 saniye içinde yüklenmezse thumbnail'e geç
    const timeout = setTimeout(() => {
      if (player.readyState < 2) {
        console.log('[Preview] Video load timeout, showing thumbnail');
        showThumbnail();
      }
    }, 3000);
    
    player.onerror = (e) => {
      clearTimeout(timeout);
      console.log('[Preview] Video error, showing thumbnail');
      showThumbnail();
    };
    
    player.onloadedmetadata = () => {
      clearTimeout(timeout);
      console.log('[Preview] Video loaded successfully');
    };
  } else {
    console.log('[Preview] No preview URL, showing thumbnail');
    showThumbnail();
  }
  
  // Apply translations after init
  applyEditorTranslations();
}


init();