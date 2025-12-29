// Ayarlar yönetimi
const SETTINGS_KEY = 'tvc_settings';

const defaultSettings = {
  language: 'tr',
  theme: 'dark',
  defaultPath: ''
};

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Settings load error:', e);
  }
  return { ...defaultSettings };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    // Also update individual keys for compatibility
    localStorage.setItem('tvc_language', settings.language);
    localStorage.setItem('tvc_theme', settings.theme);
    localStorage.setItem('tvc_defaultPath', settings.defaultPath);
  } catch (e) {
    console.error('Settings save error:', e);
  }
}

function getSetting(key) {
  const settings = loadSettings();
  return settings[key];
}

function setSetting(key, value) {
  const settings = loadSettings();
  settings[key] = value;
  saveSettings(settings);
}

function getDefaultPath() {
  return localStorage.getItem('tvc_defaultPath') || '';
}

function setDefaultPath(path) {
  localStorage.setItem('tvc_defaultPath', path);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadSettings, saveSettings, getSetting, setSetting, getDefaultPath, setDefaultPath, defaultSettings };
}
