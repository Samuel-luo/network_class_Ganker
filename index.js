const {Builder, Browser} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fillAccountPassword = require('./utils/fillAccountPassword.js');
const pollingStatus = require('./utils/pollingStatus.js');
const definedStepStatus = require('./utils/definedStepStatus.js');

let driver = null;
let account = process.env.account;
let password = process.env.password;

async function main() {
  driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(new chrome.Options().addArguments("--disable-blink-features=AutomationControlled").addArguments("--window-size=1000,1000")).build();
  await driver.get('https://passport.zhihuishu.com/login?service=https%3A%2F%2Fonlineservice-api.zhihuishu.com%2Fgateway%2Ff%2Fv1%2Flogin%2Fgologin%3Ffromurl%3Dhttps%253A%252F%252Fonlineweb.zhihuishu.com%252F');
  let {getStep, setStep} = await definedStepStatus(0);
  try {
    await fillAccountPassword(driver, account, password);
  } catch (err) {
    console.log('fillAccountPasswordError:', err);
  }
  pollingStatus(driver, getStep, setStep);
}

main().catch((err) => {
  console.log('zhs_Main:', err);
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  console.log('zhs_process_uncaughtException:', err);
  process.exit(0);
});

process.on('message', async (msg) => {
  console.log('zhs_processMessage: ', msg);
  await driver.quit().catch(() => {});
  if (msg === 'exit') {
    process.exit(0);
  }
})

process.on('exit', () => {
  console.log('zhs_processExit');
  if (driver) driver.quit();
})

process.on('SIGINT', () => {
  console.log('zhs_processExitSIGINT');
  if (driver) driver.quit();
})

