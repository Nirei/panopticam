const { contextBridge, ipcRenderer } = require('electron')

const EVENT_HOST_DISCOVERED = 'event-host-discovered'

contextBridge.exposeInMainWorld('registry', {
  hosts: () => Object.values(discovered),
  onHostDiscovered: (callback) => ipcRenderer.on(EVENT_HOST_DISCOVERED, callback)
})