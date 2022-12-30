window.addEventListener('DOMContentLoaded', () => {
  let account = document.getElementById('account');
  let password = document.getElementById('password');
  let platform = document.getElementById('platform');
  let isFillAP = document.getElementById('isFillAP');
  let chromeUrl = document.getElementById('chromeUrl');
  let button = document.getElementById('start');
  let logs = document.getElementById('logs');
  let clearLogs = document.getElementById('clearLogs');

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

  button.addEventListener('click', async () => {
    let res = await window.electronAPI.start(account.value, password.value, platform.value, isFillAP.checked, chromeUrl.value);
    console.log('createChildProcess:', res);
  })

  clearLogs.addEventListener('click', () => {
    logs.innerText = '';
  })

  window.electronAPI.processLog((e, ...args) => {
    logs.innerHTML += args.map((val) => String(val)).join(' ') + '<br/>';
    logs.scrollTop = logs.scrollHeight;
  })
});
