window.addEventListener('DOMContentLoaded', () => {
  let account = document.getElementById('account');
  let password = document.getElementById('password');
  let button = document.getElementById('start');
  let logs = document.getElementById('logs');

  button.addEventListener('click', async () => {
    let res = await window.electronAPI.start(account.value, password.value);
    console.log('createChildProcess:', res);
  })

  window.electronAPI.processLog((e, ...args) => {
    logs.innerHTML += args.map((val) => String(val)).join(' ') + '<br/>';
    logs.scrollTop = logs.scrollHeight;
  })
});