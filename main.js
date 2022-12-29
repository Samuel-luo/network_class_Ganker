const {app, BrowserWindow, ipcMain} = require('electron');
const {fork} = require('child_process');
const path = require("path");

let subprocesses = [];
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
  subprocesses.forEach(subprocess => {
    if (subprocess) subprocess.send('exit');
  })
  if (process.platform !== 'darwin') app.quit()
})

async function handleStart(e, account, password, platform, isFillAP) {
    try {
      subprocesses.push(createChildProcess({account, password, platform, isFillAP}));
    } catch (err) {
      logFn('createWorkerError:', err);
      return -1;
    }
    return 1;
}

function createChildProcess(data, index) {
  let subprocess = fork(app.isPackaged ? app.getAppPath() + '/index.js' : './index.js', {
    cwd: app.isPackaged ? app.getAppPath() : __dirname,
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    env: {
      account: data.account,
      password: data.password,
      platform: data.platform,
      isFillAP: data.isFillAP,
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
    subprocesses[index] = undefined;
  })
  return subprocess;
}

process.on('SIGINT', (...args) => {
  logFn('main_processExitSIGINT:', ...args);
  subprocesses.forEach(subprocess => {
    if (subprocess) subprocess.send('exit');
  })
})

process.on('exit', (...args) => {
  logFn('main_processExit:', ...args);
  subprocesses.forEach(subprocess => {
    if (subprocess) subprocess.send('exit');
  })
})

