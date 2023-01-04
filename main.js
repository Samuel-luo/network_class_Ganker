const {app, BrowserWindow, ipcMain} = require('electron');
const {spawn, fork, exec} = require('child_process');
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const asar = require('asar');

let subprocesses = [];
let isLoading = false;
const resourcePath = path.parse(app.getAppPath()).dir;
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
  if (app.isPackaged && !fs.existsSync(`${resourcePath}/release`)) asar.extractAll(`${resourcePath}/app.asar`, `${resourcePath}/release`);
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

app.on('before-quit', () => {
  if (isLoading) _removeFile(`${resourcePath}/app.asar-new`);
})

app.on('quit', () => {
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
    fs.writeFile(app.isPackaged ? `${resourcePath}/data.rec` : './data.rec', JSON.stringify({
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

function getRecInfo() {
  try {
    return fs.readFileSync(app.isPackaged ? `${resourcePath}/data.rec` : './data.rec', {encoding: 'utf8'});
  } catch (err) {
    return "{}";
  }
}

async function updateApp() {
  if (!app.isPackaged || isLoading) return;
  _closeChildProcess();
  logFn("开始更新...");
  try {
    logFn("创建更新脚本...");
    if (!fs.existsSync(`${resourcePath}/updater.exe`)) _copyFile(app.getAppPath() + '/updater.exe', `${resourcePath}/updater.exe`);
    logFn("开始下载最新版本资源...");
    isLoading = true;
    if (await _downloadFile('https://github.com/Samuel-luo/network_class_Ganker/releases/latest/download/app.asar', `${resourcePath}/app.asar-new`).then(() => 1).catch(() => 0)) {
      _removeDir(`${resourcePath}/release`);
      app.exit(0)
    } else {
      logFn("下载失败！");
      _removeFile(`${resourcePath}/app.asar-new`);
      isLoading = false;
    }
  } catch (err) {
    logFn(err);
  }
}

function createChildProcess(data, index) {
  let subprocess = fork(app.isPackaged ? path.join(resourcePath, 'release', 'index.js') : './index.js', {
    cwd: app.isPackaged ? `${resourcePath}/release` : __dirname, stdio: ['pipe', 'pipe', 'pipe', 'ipc'], env: {
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
      subprocess.send('exit');
    } catch (err) {
      // 静默处理 err
    }
  }
}


async function _downloadFile(url, filepath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "arraybuffer",
  });
  fs.writeFileSync(filepath, response.data, {encoding: "binary"})
}

function _copyFile(from, to) {
  fs.copyFileSync(from, to);
}

function _removeFile(filePath) {
  while (fs.existsSync(filePath)) {
    fs.rmSync(filePath);
  }
}

function _removeDir(filePath) {
  const files = []
  if (fs.existsSync(filePath)) {
    const files = fs.readdirSync(filePath)
    files.forEach((file) => {
      const nextFilePath = `${filePath}/${file}`
      const states = fs.statSync(nextFilePath)
      if (states.isDirectory()) {
        // recurse
        _removeDir(nextFilePath)
      } else {
        // delete file
        fs.unlinkSync(nextFilePath)
      }
    })
    fs.rmdirSync(filePath)
  }
}
