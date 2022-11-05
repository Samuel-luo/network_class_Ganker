const {app, BrowserWindow, ipcMain} = require('electron');
const {fork} = require('child_process');
const path = require("path");

let subprocess = null;
let logFn = (...args) => {
  console.log(...args);
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, './assets/js/preload.js'),
      nodeIntegrationInWorker: true
    }
  })

  logFn = (...args) => {
    if (!win.isDestroyed()) win.webContents.send('process-log', ...args);
    console.log(...args);
  }

  win.loadFile('./assets/index.html');
}

app.whenReady().then(() => {
  ipcMain.handle('start', handleStart)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
  if (subprocess) subprocess.send('exit');
  if (process.platform !== 'darwin') app.quit()
})

async function handleStart(e, account, password) {
  if (!subprocess) {
    try {
      subprocess = createChildProcess({account, password});
    } catch (err) {
      logFn('createWorkerError:', err);
      return -1;
    }
    return 1;
  } else {
    if (subprocess) subprocess.send('exit');
    subprocess = createChildProcess({account, password});
  }
}

function createChildProcess(data) {
  let subprocess = fork(app.isPackaged ? app.getAppPath() + '/index.js' : './index.js', {
    cwd: app.isPackaged ? app.getAppPath() : __dirname,
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    env: {
      account: data.account,
      password: data.password
    }
  });
  subprocess.stdout.on('data', (msg) => {
    logFn('child_processStdOut:', msg.toString());
  })
  subprocess.stderr.on('data', (msg) => {
    logFn('child_processStdErr:', msg.toString());
  })
  subprocess.on('close', (...args) => {
    logFn('child_processClose:', ...args);
    subprocess = null;
  })
  return subprocess;
}

process.on('SIGINT', (...args) => {
  logFn('main_processExitSIGINT:', ...args);
  if (subprocess) subprocess.send('exit');
})

process.on('exit', (...args) => {
  logFn('main_processExit:', ...args);
  if (subprocess) subprocess.send('exit');
})

