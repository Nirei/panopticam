const { contextBridge, ipcRenderer } = require('electron')

const EVENT_NEW_HOST_DISCOVERED = 'event-new-host-discovered'

contextBridge.exposeInMainWorld('registry', {
  hosts: () => Object.values(discovered),
  onHostDiscovered: (callback) => ipcRenderer.on(EVENT_NEW_HOST_DISCOVERED, callback)
})