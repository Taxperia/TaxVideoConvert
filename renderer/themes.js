// Tema yönetimi
const themes = {
  dark: {
    name: 'dark',
    bg: '#111111',
    panel: '#171717',
    text: '#e5e5e5',
    muted: '#a3a3a3',
    accent: '#3b82f6',
    accent2: '#22c55e',
    danger: '#ef4444',
    border: '#262626',
    input: '#0a0a0a',
    button: '#1f1f1f'
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
  },
  green: {
    name: 'green',
    bg: '#052e16',
    panel: '#14532d',
    text: '#dcfce7',
    muted: '#86efac',
    accent: '#22c55e',
    accent2: '#4ade80',
    danger: '#f87171',
    border: '#166534',
    input: '#022c22',
    button: '#15803d'
  },
  red: {
    name: 'red',
    bg: '#1c0a0a',
    panel: '#2d1515',
    text: '#fef2f2',
    muted: '#fca5a5',
    accent: '#ef4444',
    accent2: '#f87171',
    danger: '#fbbf24',
    border: '#7f1d1d',
    input: '#1a0505',
    button: '#991b1b'
  },
  orange: {
    name: 'orange',
    bg: '#1c1008',
    panel: '#2d1e10',
    text: '#fff7ed',
    muted: '#fdba74',
    accent: '#f97316',
    accent2: '#fb923c',
    danger: '#ef4444',
    border: '#9a3412',
    input: '#1a0f05',
    button: '#c2410c'
  },
  cyan: {
    name: 'cyan',
    bg: '#042f2e',
    panel: '#134e4a',
    text: '#ccfbf1',
    muted: '#5eead4',
    accent: '#14b8a6',
    accent2: '#2dd4bf',
    danger: '#f87171',
    border: '#115e59',
    input: '#022c2c',
    button: '#0f766e'
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
