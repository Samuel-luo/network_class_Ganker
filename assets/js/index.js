window.addEventListener('DOMContentLoaded', () => {
  let account = document.getElementById('account');
  let password = document.getElementById('password');
  let platform = document.getElementById('platform');
  let isFillAP = document.getElementById('isFillAP');
  let chromeUrl = document.getElementById('chromeUrl');
  let start = document.getElementById('start');
  let clearLogs = document.getElementById('clearLogs');
  let updateApp = document.getElementById('updateApp');
  let logs = document.getElementById('logs');

  window.electronAPI.getRecInfo().then(res => {
    const rec = JSON.parse(res || '{}');
    account.value = rec.account || '';
    password.value = rec.password || '';
    platform.value = rec.platform || '';
    if (rec.isFillAP) {
      isFillAP.setAttribute('checked', '');
    } else {
      isFillAP.removeAttribute('checked');
    }
    chromeUrl.value = rec.chromeUrl || '';
  })

  start.addEventListener('click', async () => {
    let res = await window.electronAPI.start(account.value, password.value, platform.value, isFillAP.checked, chromeUrl.value);
    console.log('createChildProcess:', res);
  })

  clearLogs.addEventListener('click', () => {
    logs.innerText = '';
  })

  updateApp.addEventListener('click', async () => {
    await window.electronAPI.updateApp();
  })

  window.electronAPI.processLog((e, ...args) => {
    logs.innerHTML += args.map((val) => String(val)).join(' ') + '<br/>';
    logs.scrollTop = logs.scrollHeight;
  })
});
