const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI',{
  start: (...args) => ipcRenderer.invoke('start', ...args),
  getRecInfo: () => ipcRenderer.invoke('get-rec-info'),
  processLog: (cb) => ipcRenderer.on('process-log', cb),
})