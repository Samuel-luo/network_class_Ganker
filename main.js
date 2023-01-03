const {app, BrowserWindow, ipcMain} = require('electron');
const {fork} = require('child_process');
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const {spawn} = require('child_process');

let subprocesses = [];
let logFn = (...args) => {
  console.log(...args);
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000, height: 800, webPreferences: {
      preload: path.join(__dirname, './assets/js/preload.js'), nodeIntegrationInWorker: true
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
  ipcMain.handle('updateApp', updateApp)
  ipcMain.handle('get-rec-info', getRecInfo)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
  _closeChildProcess()
  if (process.platform !== 'darwin') app.quit()
})

app.on('quit', () => {
  const resourcePath = path.parse(app.getAppPath()).dir;
  if (fs.existsSync(`${resourcePath}/updater.exe`) && fs.existsSync(`${resourcePath}/app.asar-new`)) {
    logFn("开始替换资源...");
    const child = spawn(`"${resourcePath}/updater.exe"`, {
      detached: true,
      shell: true,
      cwd: resourcePath,
      stdio: 'ignore'
    });
    child.unref();
  }
})

async function handleStart(e, account, password, platform, isFillAP, chromeUrl) {
  try {
    fs.writeFile(app.isPackaged ? app.getAppPath() + '/data.rec' : './data.rec', JSON.stringify({
      account,
      password,
      platform,
      isFillAP,
      chromeUrl
    }), {encoding: 'utf8'}, () => {
    })
    subprocesses.push(createChildProcess({account, password, platform, isFillAP, chromeUrl}, subprocesses.length));
  } catch (err) {
    logFn('createWorkerError:', err);
    return -1;
  }
  return 1;
}

async function updateApp() {
  if (!app.isPackaged) return;
  logFn("开始更新...");
  const resourcePath = path.parse(app.getAppPath()).dir;
  try {
    logFn("创建更新脚本...");
    if (!fs.existsSync(`${resourcePath}/updater.exe`)) fs.copyFileSync(app.getAppPath() + '/updater.exe', `${resourcePath}/updater.exe`);
    logFn("开始下载最新版本资源...")
    if (await _downloadFile('https://github.com/Samuel-luo/network_class_Ganker/releases/latest/download/app.asar', `${resourcePath}/app.asar-new`).then(() => 1).catch(() => 0)) {
      app.exit(0)
    } else {
      logFn("下载失败！");
    }
  } catch (err) {
    logFn(err);
  }
}

function getRecInfo() {
  try {
    return fs.readFileSync(app.isPackaged ? app.getAppPath() + '/data.rec' : './data.rec', {encoding: 'utf8'});
  } catch (err) {
    return "{}";
  }
}

function createChildProcess(data, index) {
  let subprocess = fork(app.isPackaged ? app.getAppPath() + '/index.js' : './index.js', {
    cwd: app.isPackaged ? app.getAppPath() : __dirname, stdio: ['pipe', 'pipe', 'pipe', 'ipc'], env: {
      account: data.account, password: data.password, platform: data.platform, isFillAP: data.isFillAP, chromeUrl: data.chromeUrl
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
  _closeChildProcess()
})

process.on('exit', (...args) => {
  logFn('main_processExit:', ...args);
  _closeChildProcess()
})

function _closeChildProcess() {
  let subprocess;
  while (subprocess = subprocesses.shift()) {
    try {
      if (subprocess) {
        subprocess.send('exit');
      }
    } catch (err) {
      // 静默处理 err
    }
  }
}


async function _downloadFile(url, filepath) {
  const writer = fs.createWriteStream(filepath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
