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
const settingsNavItems = document.querySelectorAll('.settings-nav-item');
const settingsSections = document.querySelectorAll('.settings-section');
const languageSelect = document.getElementById('languageSelect');
const themeSelect = document.getElementById('themeSelect');
const defaultPathInput = document.getElementById('defaultPathInput');
const browsePathBtn = document.getElementById('browsePathBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const themePreviewBoxes = document.querySelectorAll('.theme-preview-box');

// Cookies settings elements
const cookiesFromSelect = document.getElementById('cookiesFromSelect');
const cookiesFilePathItem = document.getElementById('cookiesFilePathItem');
const cookiesFilePathInput = document.getElementById('cookiesFilePathInput');
const browseCookiesBtn = document.getElementById('browseCookiesBtn');

// Load settings
function loadCurrentSettings() {
  const lang = localStorage.getItem('tvc_language') || 'tr';
  const theme = localStorage.getItem('tvc_theme') || 'dark';
  const defaultPath = localStorage.getItem('tvc_defaultPath') || '';
  const cookiesFrom = localStorage.getItem('tvc_cookiesFrom') || 'none';
  const cookiesFilePath = localStorage.getItem('tvc_cookiesFilePath') || '';
  
  languageSelect.value = lang;
  themeSelect.value = theme;
  defaultPathInput.value = defaultPath;
  
  // Cookies settings
  if (cookiesFromSelect) {
    cookiesFromSelect.value = cookiesFrom;
    toggleCookiesFilePath(cookiesFrom);
  }
  if (cookiesFilePathInput) {
    cookiesFilePathInput.value = cookiesFilePath;
  }
}

// Toggle cookies file path visibility
function toggleCookiesFilePath(value) {
  if (cookiesFilePathItem) {
    cookiesFilePathItem.style.display = value === 'file' ? 'flex' : 'none';
  }
}

// Apply translations
function applyTranslations() {
  document.getElementById('appTitle').textContent = t('appTitle');
  document.getElementById('enterUrlText').textContent = t('enterUrl');
  document.getElementById('videoUrl').placeholder = t('urlPlaceholder');
  document.getElementById('continueBtn').textContent = t('continueBtn');
  document.getElementById('usageNote').textContent = t('usageNote');
  
  // New settings panel translations
  const generalTabBtn = document.getElementById('generalTabBtn');
  const appearanceTabBtn = document.getElementById('appearanceTabBtn');
  const aboutTabBtn = document.getElementById('aboutTabBtn');
  
  if (generalTabBtn) generalTabBtn.textContent = t('generalTab');
  if (appearanceTabBtn) appearanceTabBtn.textContent = t('appearanceTab') || 'Görünüm';
  if (aboutTabBtn) aboutTabBtn.textContent = t('aboutTab');
  
  const languageLabel = document.getElementById('languageLabel');
  const themeLabel = document.getElementById('themeLabel');
  const defaultPathLabel = document.getElementById('defaultPathLabel');
  
  if (languageLabel) languageLabel.textContent = t('language');
  if (themeLabel) themeLabel.textContent = t('theme');
  if (defaultPathLabel) defaultPathLabel.textContent = t('defaultPath');
  
  document.getElementById('themeDarkOpt').textContent = t('themeDark');
  document.getElementById('themeLightOpt').textContent = t('themeLight');
  document.getElementById('themeBlueOpt').textContent = t('themeBlue');
  document.getElementById('themePurpleOpt').textContent = t('themePurple');
  document.getElementById('aboutText').textContent = t('aboutText');
  document.getElementById('settingsBtn').title = t('settings');
  
  // Cookies translations
  const cookiesLabel = document.getElementById('cookiesLabel');
  const cookiesDesc = document.getElementById('cookiesDesc');
  const cookiesNoneOpt = document.getElementById('cookiesNoneOpt');
  const cookiesChromeOpt = document.getElementById('cookiesChromeOpt');
  const cookiesFirefoxOpt = document.getElementById('cookiesFirefoxOpt');
  const cookiesEdgeOpt = document.getElementById('cookiesEdgeOpt');
  const cookiesBraveOpt = document.getElementById('cookiesBraveOpt');
  const cookiesOperaOpt = document.getElementById('cookiesOperaOpt');
  const cookiesFileOpt = document.getElementById('cookiesFileOpt');
  const cookiesFilePathLabel = document.getElementById('cookiesFilePathLabel');
  const cookiesFileHint = document.getElementById('cookiesFileHint');
  
  if (cookiesLabel) cookiesLabel.textContent = t('cookiesLabel');
  if (cookiesDesc) cookiesDesc.textContent = t('cookiesDesc');
  if (cookiesNoneOpt) cookiesNoneOpt.textContent = t('cookiesNone');
  if (cookiesChromeOpt) cookiesChromeOpt.textContent = t('cookiesChrome');
  if (cookiesFirefoxOpt) cookiesFirefoxOpt.textContent = t('cookiesFirefox');
  if (cookiesEdgeOpt) cookiesEdgeOpt.textContent = t('cookiesEdge');
  if (cookiesBraveOpt) cookiesBraveOpt.textContent = t('cookiesBrave');
  if (cookiesOperaOpt) cookiesOperaOpt.textContent = t('cookiesOpera');
  if (cookiesFileOpt) cookiesFileOpt.textContent = t('cookiesFile');
  if (cookiesFilePathLabel) cookiesFilePathLabel.textContent = t('cookiesFilePath');
  if (cookiesFileHint) cookiesFileHint.textContent = t('cookiesFileHint');
  
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
themePreviewBoxes.forEach(box => {
  box.addEventListener('click', () => {
    const theme = box.dataset.theme;
    themeSelect.value = theme;
    applyTheme(theme);
  });
});

// Browse path
browsePathBtn.addEventListener('click', async () => {
  const result = await window.api.chooseFolder();
  if (result.ok && result.path) {
    defaultPathInput.value = result.path;
  }
});

// Browse cookies file
if (browseCookiesBtn) {
  browseCookiesBtn.addEventListener('click', async () => {
    const result = await window.api.chooseCookiesFile();
    if (result.ok && result.path) {
      cookiesFilePathInput.value = result.path;
    }
  });
}

// Cookies from select change
if (cookiesFromSelect) {
  cookiesFromSelect.addEventListener('change', () => {
    toggleCookiesFilePath(cookiesFromSelect.value);
  });
}

// Save settings
saveSettingsBtn.addEventListener('click', () => {
  const lang = languageSelect.value;
  const theme = themeSelect.value;
  const defaultPath = defaultPathInput.value;
  const cookiesFrom = cookiesFromSelect ? cookiesFromSelect.value : 'none';
  const cookiesFilePath = cookiesFilePathInput ? cookiesFilePathInput.value : '';
  
  localStorage.setItem('tvc_language', lang);
  localStorage.setItem('tvc_theme', theme);
  localStorage.setItem('tvc_defaultPath', defaultPath);
  localStorage.setItem('tvc_cookiesFrom', cookiesFrom);
  localStorage.setItem('tvc_cookiesFilePath', cookiesFilePath);
  
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
    // Cookies ayarlarını al
    const cookiesOptions = {
      cookiesFrom: localStorage.getItem('tvc_cookiesFrom') || 'none',
      cookiesFilePath: localStorage.getItem('tvc_cookiesFilePath') || ''
    };
    
    const res = await window.api.fetchVideoInfo(url, cookiesOptions);
    if (!res.ok) {
      let errorMsg = res.error || t('unknownError');
      // Çerez hatası kontrolü
      if (errorMsg.includes('Could not copy') && errorMsg.includes('cookie database')) {
        errorMsg = t('cookiesError');
      }
      errorEl.textContent = t('fetchError') + errorMsg;
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