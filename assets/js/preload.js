const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI',{
  start: (...args) => ipcRenderer.invoke('start', ...args),
  processLog: (cb) => ipcRenderer.on('process-log', cb)
})