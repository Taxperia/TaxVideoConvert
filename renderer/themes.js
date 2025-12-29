// Tema yönetimi
const themes = {
  dark: {
    name: 'dark',
    bg: '#0f1215',
    panel: '#161a1f',
    text: '#e2e8f0',
    muted: '#94a3b8',
    accent: '#3b82f6',
    accent2: '#22c55e',
    danger: '#ef4444',
    border: '#253043',
    input: '#0c0f13',
    button: '#1f2937'
  },
  light: {
    name: 'light',
    bg: '#f5f5f5',
    panel: '#ffffff',
    text: '#1a1a1a',
    muted: '#666666',
    accent: '#2563eb',
    accent2: '#16a34a',
    danger: '#dc2626',
    border: '#d1d5db',
    input: '#ffffff',
    button: '#e5e7eb'
  },
  blue: {
    name: 'blue',
    bg: '#0a1628',
    panel: '#0f2847',
    text: '#e0f2fe',
    muted: '#7dd3fc',
    accent: '#0ea5e9',
    accent2: '#22d3ee',
    danger: '#f87171',
    border: '#1e4976',
    input: '#071422',
    button: '#164e78'
  },
  purple: {
    name: 'purple',
    bg: '#1a0a2e',
    panel: '#2d1b4e',
    text: '#f3e8ff',
    muted: '#c4b5fd',
    accent: '#a855f7',
    accent2: '#e879f9',
    danger: '#fb7185',
    border: '#4c1d95',
    input: '#120820',
    button: '#3b1d6e'
  }
};

function applyTheme(themeName) {
  const theme = themes[themeName] || themes.dark;
  const root = document.documentElement;
  
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--panel', theme.panel);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent2', theme.accent2);
  root.style.setProperty('--danger', theme.danger);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--input', theme.input);
  root.style.setProperty('--button', theme.button);
  
  document.body.setAttribute('data-theme', themeName);
  localStorage.setItem('tvc_theme', themeName);
}

function getCurrentTheme() {
  return localStorage.getItem('tvc_theme') || 'dark';
}

function initTheme() {
  applyTheme(getCurrentTheme());
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { themes, applyTheme, getCurrentTheme, initTheme };
}
