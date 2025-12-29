const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Updater API
  checkForUpdates: () => ipcRenderer.invoke('checkForUpdates'),
  downloadUpdate: () => ipcRenderer.invoke('downloadUpdate'),
  installUpdate: () => ipcRenderer.invoke('installUpdate'),
  getAppVersion: () => ipcRenderer.invoke('getAppVersion'),
  onUpdateAvailable: (cb) => {
    const listener = (_, data) => cb(data);
    ipcRenderer.on('updateAvailable', listener);
    return () => ipcRenderer.removeListener('updateAvailable', listener);
  },
  onUpdateDownloaded: (cb) => {
    const listener = (_, data) => cb(data);
    ipcRenderer.on('updateDownloaded', listener);
    return () => ipcRenderer.removeListener('updateDownloaded', listener);
  },
  onUpdateProgress: (cb) => {
    const listener = (_, data) => cb(data);
    ipcRenderer.on('updateProgress', listener);
    return () => ipcRenderer.removeListener('updateProgress', listener);
  },
  onUpdateError: (cb) => {
    const listener = (_, data) => cb(data);
    ipcRenderer.on('updateError', listener);
    return () => ipcRenderer.removeListener('updateError', listener);
  },
  
  // Existing API
  fetchVideoInfo: (url) => ipcRenderer.invoke('fetchVideoInfo', url),
  getLastVideoInfo: () => ipcRenderer.invoke('getLastVideoInfo'),
  openEditorPage: () => ipcRenderer.invoke('openEditorPage'),
  chooseOutputPath: (opts) => ipcRenderer.invoke('chooseOutputPath', opts),
  chooseFolder: () => ipcRenderer.invoke('chooseFolder'),
  getDefaultDocumentsPath: () => ipcRenderer.invoke('getDefaultDocumentsPath'),
  startExport: (params) => ipcRenderer.invoke('startExport', params),
  onExportProgress: (cb) => {
    const listener = (_, data) => cb(data);
    ipcRenderer.on('exportProgress', listener);
    return () => ipcRenderer.removeListener('exportProgress', listener);
  },
  revealInFolder: (filePath) => ipcRenderer.invoke('revealInFolder', filePath),
  openExternal: (url) => ipcRenderer.invoke('openExternal', url)
});