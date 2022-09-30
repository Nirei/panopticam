const { app, BrowserWindow } = require('electron')
const path = require('path')

const PAGE_PATH = path.join(app.getAppPath(), 'app/index.html')
const ICON_PATH = path.join(app.getAppPath(), 'build/icon.png')

class Application {
  constructor() {
    this.mainWindow = undefined;
  }

  async run() {
    // Note: Must match `build.appId` in package.json.
    app.setAppUserModelId('org.lostrego.Panopticam')

    // Electron Reloader
    try {
      require('electron-reloader')(module)
    } catch {}

    // Prevent multiple instances of the app
    if (!app.requestSingleInstanceLock()) {
      app.quit()
    }

    app.on('second-instance', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore()
        }

        this.mainWindow.show()
      }
    })

    app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') app.quit()
    })

    app.on('activate', async () => {
      if (!this.mainWindow) {
        this.mainWindow = await createMainWindow()
      }
    })

    await app.whenReady()
    this.mainWindow = this.createMainWindow()
    await this.mainWindow.loadFile(PAGE_PATH)
  }

  createMainWindow() {
    const win = new BrowserWindow({
      title: app.name,
      show: false,
      width: 1000,
      height: 800,
      icon: ICON_PATH,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(app.getAppPath(), './app/preload.js'),
      },
    })

    win.on('ready-to-show', () => win.show())
    win.on('closed', () => (this.mainWindow = undefined))
    win.removeMenu()
    win.webContents.openDevTools()

    return win
  }
}

// Singleton
exports.application = new Application()