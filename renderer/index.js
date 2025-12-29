// Initialize theme and language
initTheme();
applyTranslations();

// ===================== Update System =====================
const updateNotification = document.getElementById('updateNotification');
const updateTitle = document.getElementById('updateTitle');
const updateMessage = document.getElementById('updateMessage');
const updateDownloadBtn = document.getElementById('updateDownloadBtn');
const updateLaterBtn = document.getElementById('updateLaterBtn');
const updateRestartBtn = document.getElementById('updateRestartBtn');
const updateProgressContainer = document.getElementById('updateProgressContainer');
const updateProgressFill = document.getElementById('updateProgressFill');
const updateProgressText = document.getElementById('updateProgressText');
const checkUpdateBtn = document.getElementById('checkUpdateBtn');
const updateStatus = document.getElementById('updateStatus');
const appVersionDisplay = document.getElementById('appVersionDisplay');

let pendingUpdateVersion = null;

// Load app version
async function loadAppVersion() {
  try {
    const version = await window.api.getAppVersion();
    if (appVersionDisplay) {
      appVersionDisplay.textContent = version;
    }
  } catch (e) {
    console.error('Version load error:', e);
  }
}
loadAppVersion();

// Update Available Handler
window.api.onUpdateAvailable((data) => {
  pendingUpdateVersion = data.version;
  updateTitle.textContent = t('updateAvailable');
  updateMessage.textContent = `${t('updateAvailableMsg')}: v${data.version}`;
  updateDownloadBtn.textContent = t('downloadUpdate');
  updateLaterBtn.textContent = t('later');
  updateDownloadBtn.style.display = 'inline-block';
  updateLaterBtn.style.display = 'inline-block';
  updateRestartBtn.style.display = 'none';
  updateProgressContainer.style.display = 'none';
  updateNotification.style.display = 'block';
});

// Update Progress Handler
window.api.onUpdateProgress((data) => {
  updateTitle.textContent = t('downloading');
  updateMessage.textContent = `v${pendingUpdateVersion}`;
  updateDownloadBtn.style.display = 'none';
  updateLaterBtn.style.display = 'none';
  updateProgressContainer.style.display = 'flex';
  updateProgressFill.style.width = `${data.percent}%`;
  updateProgressText.textContent = `${Math.round(data.percent)}%`;
});

// Update Downloaded Handler
window.api.onUpdateDownloaded((data) => {
  updateTitle.textContent = t('updateReady');
  updateMessage.textContent = t('updateReadyMsg');
  updateDownloadBtn.style.display = 'none';
  updateLaterBtn.style.display = 'none';
  updateProgressContainer.style.display = 'none';
  updateRestartBtn.textContent = t('restartNow');
  updateRestartBtn.style.display = 'inline-block';
});

// Update Error Handler
window.api.onUpdateError((data) => {
  console.error('Update error:', data.message);
  updateNotification.style.display = 'none';
  if (updateStatus) {
    updateStatus.textContent = `${t('updateError')}: ${data.message}`;
    updateStatus.className = 'update-status error';
  }
});

// Download button click
updateDownloadBtn.addEventListener('click', async () => {
  updateDownloadBtn.disabled = true;
  await window.api.downloadUpdate();
});

// Later button click
updateLaterBtn.addEventListener('click', () => {
  updateNotification.style.display = 'none';
});

// Restart button click
updateRestartBtn.addEventListener('click', () => {
  window.api.installUpdate();
});

// Check for updates button in About tab
if (checkUpdateBtn) {
  checkUpdateBtn.addEventListener('click', async () => {
    const checkUpdateText = document.getElementById('checkUpdateText');
    checkUpdateBtn.disabled = true;
    checkUpdateText.textContent = t('checkingUpdate');
    updateStatus.textContent = '';
    updateStatus.className = 'update-status';
    
    try {
      const result = await window.api.checkForUpdates();
      if (!result.ok) {
        updateStatus.textContent = result.error || t('updateError');
        updateStatus.className = 'update-status error';
      } else if (!pendingUpdateVersion) {
        // No update available (updateAvailable event didn't fire)
        setTimeout(() => {
          if (!pendingUpdateVersion) {
            updateStatus.textContent = t('noUpdateAvailable');
            updateStatus.className = 'update-status success';
          }
        }, 2000);
      }
    } catch (e) {
      updateStatus.textContent = t('updateError');
      updateStatus.className = 'update-status error';
    } finally {
      checkUpdateBtn.disabled = false;
      checkUpdateText.textContent = t('checkForUpdates');
    }
  });
}

const form = document.getElementById('urlForm');
const input = document.getElementById('videoUrl');
const errorEl = document.getElementById('error');

// Settings Modal Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModalBtn = document.getElementById('closeModal');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const languageSelect = document.getElementById('languageSelect');
const themeSelect = document.getElementById('themeSelect');
const defaultPathInput = document.getElementById('defaultPathInput');
const browsePathBtn = document.getElementById('browsePathBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// Load settings
function loadCurrentSettings() {
  const lang = localStorage.getItem('tvc_language') || 'tr';
  const theme = localStorage.getItem('tvc_theme') || 'dark';
  const defaultPath = localStorage.getItem('tvc_defaultPath') || '';
  
  languageSelect.value = lang;
  themeSelect.value = theme;
  defaultPathInput.value = defaultPath;
}

// Apply translations
function applyTranslations() {
  document.getElementById('appTitle').textContent = t('appTitle');
  document.getElementById('enterUrlText').textContent = t('enterUrl');
  document.getElementById('videoUrl').placeholder = t('urlPlaceholder');
  document.getElementById('continueBtn').textContent = t('continueBtn');
  document.getElementById('usageNote').textContent = t('usageNote');
  document.getElementById('settingsTitle').textContent = t('settingsTitle');
  document.querySelector('#generalTabBtn span').textContent = t('generalTab');
  document.querySelector('#aboutTabBtn span').textContent = t('aboutTab');
  document.getElementById('languageLabel').textContent = t('language');
  document.getElementById('themeLabel').textContent = t('theme');
  document.getElementById('defaultPathLabel').textContent = t('defaultPath');
  document.querySelector('#browsePathBtn span').textContent = t('browsePath');
  document.querySelector('#saveSettingsBtn span').textContent = t('saveSettings');
  document.getElementById('themeDarkOpt').textContent = '🌙 ' + t('themeDark');
  document.getElementById('themeLightOpt').textContent = '☀️ ' + t('themeLight');
  document.getElementById('themeBlueOpt').textContent = '💙 ' + t('themeBlue');
  document.getElementById('themePurpleOpt').textContent = '💜 ' + t('themePurple');
  document.getElementById('aboutText').textContent = t('aboutText');
  document.getElementById('versionLabel').textContent = t('version');
  document.getElementById('developerLabel').textContent = t('developer');
  document.getElementById('settingsBtn').title = t('settings');
  
  // Update system translations
  const checkUpdateText = document.getElementById('checkUpdateText');
  if (checkUpdateText) checkUpdateText.textContent = t('checkForUpdates');
}

// Settings Modal
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

// Tab switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
  });
});

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
  applyTranslations();
  
  settingsModal.style.display = 'none';
});

// Theme change preview
themeSelect.addEventListener('change', () => {
  applyTheme(themeSelect.value);
});

const continueBtn = document.getElementById('continueBtn');
let isLoading = false;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  const url = input.value.trim();
  if (!url || isLoading) return;

  // Yükleme durumunu göster
  isLoading = true;
  const originalText = continueBtn.textContent;
  continueBtn.textContent = t('loading') || 'Yükleniyor...';
  continueBtn.disabled = true;
  continueBtn.classList.add('loading');

  try {
    const res = await window.api.fetchVideoInfo(url);
    if (!res.ok) {
      errorEl.textContent = t('fetchError') + (res.error || t('unknownError'));
      return;
    }
    // Editor sayfasını aç
    await window.api.openEditorPage();
  } catch (err) {
    errorEl.textContent = t('error') + (err.message || err);
  } finally {
    isLoading = false;
    continueBtn.textContent = originalText;
    continueBtn.disabled = false;
    continueBtn.classList.remove('loading');
  }
});