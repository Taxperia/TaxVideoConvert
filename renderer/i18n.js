// Dil desteği - Türkçe ve İngilizce
const translations = {
  tr: {
    // Index page
    appTitle: 'TaxVideoConvert',
    enterUrl: 'Video bağlantısını gir:',
    urlPlaceholder: 'https://youtube.com/watch?v=... veya kick.com/...',
    continueBtn: 'Devam',
    loading: 'Yükleniyor...',
    usageNote: 'Sadece kendi içeriklerin ve platform kullanım şartlarına uygun şekilde kullanmalısın.',
    fetchError: 'Bilgi alınamadı: ',
    unknownError: 'Bilinmeyen hata',
    error: 'Hata: ',
    settings: 'Ayarlar',
    
    // Settings Modal
    settingsTitle: 'Ayarlar',
    generalTab: 'Genel',
    aboutTab: 'Hakkında',
    language: 'Dil',
    theme: 'Tema',
    defaultPath: 'Varsayılan Kayıt Yolu',
    browsePath: 'Gözat',
    saveSettings: 'Kaydet',
    closeSettings: 'Kapat',
    
    // Themes
    themeDark: 'Koyu',
    themeLight: 'Açık',
    themeBlue: 'Mavi',
    themePurple: 'Mor',
    
    // Editor page
    editorTitle: 'Editör',
    startSec: 'Başlangıç (s):',
    endSec: 'Bitiş (s):',
    setIn: 'In = O an',
    setOut: 'Out = O an',
    playInOut: 'In-Out Oynat',
    stopPlay: 'Durdur',
    
    // Output settings
    outputSettings: 'Çıkış Ayarları',
    mode: 'Mod:',
    modeBoth: 'Video + Ses',
    modeVideo: 'Sadece Video',
    modeAudio: 'Sadece Ses',
    quality: 'Kalite (yükseklik):',
    qualityAuto: 'Otomatik (maks.)',
    container: 'Konteyner:',
    videoCodec: 'Video Codec:',
    audioCodec: 'Audio Codec:',
    codecCopy: 'copy (yeniden kodlama yok)',
    chooseOutPath: 'Kaydetme Yolunu Seç',
    exportBtn: 'Dışa Aktar',
    
    // Meta
    duration: 'Süre',
    channel: 'Kanal',
    maxPreview: 'Max Önizleme',
    notFound: 'bulunamadı',
    noPreviewWarning: 'Uyarı: Progressive önizleme akışı bulunamadı; yine de dışa aktarım çalışacaktır.',
    
    // Progress
    processingStart: 'İşlem başlatılıyor...',
    completed: 'Tamamlandı: ',
    showInFolder: 'Klasörde Göster',
    time: 'Zaman',
    speed: 'Hız',
    size: 'Boyut',
    selectOutputPath: 'Lütfen çıkış dosya yolunu seçin.',
    noVideoInfo: 'Video bilgisi bulunamadı. Geri dönüp URL girin.',
    
    // About
    aboutText: 'TaxVideoConvert, YouTube, Kick ve diğer video platformlarından video indirip kırpmanıza olanak tanıyan bir masaüstü uygulamasıdır.',
    version: 'Sürüm',
    developer: 'Geliştirici',
    developerName: 'Miyotu',
    
    // Updater
    updateAvailable: 'Güncelleme Mevcut',
    updateAvailableMsg: 'Yeni bir sürüm mevcut',
    downloadUpdate: 'İndir',
    later: 'Sonra',
    downloading: 'İndiriliyor...',
    updateReady: 'Güncelleme Hazır',
    updateReadyMsg: 'Güncelleme indirildi. Yüklemek için uygulamayı yeniden başlatın.',
    restartNow: 'Şimdi Yeniden Başlat',
    updateError: 'Güncelleme hatası',
    checkingUpdate: 'Güncelleme kontrol ediliyor...',
    noUpdateAvailable: 'Uygulama güncel',
    checkForUpdates: 'Güncelleme Kontrol Et'
  },
  
  en: {
    // Index page
    appTitle: 'TaxVideoConvert',
    enterUrl: 'Enter video URL:',
    urlPlaceholder: 'https://youtube.com/watch?v=... or kick.com/...',
    continueBtn: 'Continue',
    loading: 'Loading...',
    usageNote: 'Use only for your own content and in compliance with platform terms of service.',
    fetchError: 'Could not fetch info: ',
    unknownError: 'Unknown error',
    error: 'Error: ',
    settings: 'Settings',
    
    // Settings Modal
    settingsTitle: 'Settings',
    generalTab: 'General',
    aboutTab: 'About',
    language: 'Language',
    theme: 'Theme',
    defaultPath: 'Default Save Path',
    browsePath: 'Browse',
    saveSettings: 'Save',
    closeSettings: 'Close',
    
    // Themes
    themeDark: 'Dark',
    themeLight: 'Light',
    themeBlue: 'Blue',
    themePurple: 'Purple',
    
    // Editor page
    editorTitle: 'Editor',
    startSec: 'Start (s):',
    endSec: 'End (s):',
    setIn: 'In = Now',
    setOut: 'Out = Now',
    playInOut: 'Play In-Out',
    stopPlay: 'Stop',
    
    // Output settings
    outputSettings: 'Output Settings',
    mode: 'Mode:',
    modeBoth: 'Video + Audio',
    modeVideo: 'Video Only',
    modeAudio: 'Audio Only',
    quality: 'Quality (height):',
    qualityAuto: 'Auto (max)',
    container: 'Container:',
    videoCodec: 'Video Codec:',
    audioCodec: 'Audio Codec:',
    codecCopy: 'copy (no re-encoding)',
    chooseOutPath: 'Choose Save Path',
    exportBtn: 'Export',
    
    // Meta
    duration: 'Duration',
    channel: 'Channel',
    maxPreview: 'Max Preview',
    notFound: 'not found',
    noPreviewWarning: 'Warning: Progressive preview stream not found; export will still work.',
    
    // Progress
    processingStart: 'Processing starting...',
    completed: 'Completed: ',
    showInFolder: 'Show in Folder',
    time: 'Time',
    speed: 'Speed',
    size: 'Size',
    selectOutputPath: 'Please select an output file path.',
    noVideoInfo: 'Video info not found. Go back and enter URL.',
    
    // About
    aboutText: 'TaxVideoConvert is a desktop application that allows you to download and trim videos from YouTube, Kick and other video platforms.',
    version: 'Version',
    developer: 'Developer',
    developerName: 'Miyotu',
    
    // Updater
    updateAvailable: 'Update Available',
    updateAvailableMsg: 'A new version is available',
    downloadUpdate: 'Download',
    later: 'Later',
    downloading: 'Downloading...',
    updateReady: 'Update Ready',
    updateReadyMsg: 'Update downloaded. Restart the application to install.',
    restartNow: 'Restart Now',
    updateError: 'Update error',
    checkingUpdate: 'Checking for updates...',
    noUpdateAvailable: 'Application is up to date',
    checkForUpdates: 'Check for Updates'
  }
};

function t(key) {
  const lang = localStorage.getItem('tvc_language') || 'tr';
  return translations[lang]?.[key] || translations['tr'][key] || key;
}

function getCurrentLang() {
  return localStorage.getItem('tvc_language') || 'tr';
}

function setLang(lang) {
  localStorage.setItem('tvc_language', lang);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { translations, t, getCurrentLang, setLang };
}
