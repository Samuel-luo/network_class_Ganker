const {Builder, Browser} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fillAccountPassword = require('./utils/fillAccountPassword.js');
const pollingStatus = require('./utils/pollingStatus.js');
const definedStepStatus = require('./utils/definedStepStatus.js');
const zhsPolling = require('./utils/zhs/polling.js');
const shixunPolling = require('./utils/shixun/polling.js');

let driver = null;
let account = process.env.account;
let password = process.env.password;
let platform = process.env.platform;
let isFillAP = process.env.isFillAP;
let chromeUrl = process.env.chromeUrl;

platform = ((originUrl) => {
  switch (originUrl) {
    case "zhihuishu": {
      return {
        url: "https://passport.zhihuishu.com/login?service=https%3A%2F%2Fonlineservice-api.zhihuishu.com%2Fgateway%2Ff%2Fv1%2Flogin%2Fgologin%3Ffromurl%3Dhttps%253A%252F%252Fonlineweb.zhihuishu.com%252F",
        polling: zhsPolling,
        fillAP: {account: "lUsername", password: "lPassword"}
      }
    }
    case "shixun": {
      return {
        url: "http://pt.1000phone.com/userLogin",
        polling: shixunPolling,
        pollingInterval: 5000,
      }
    }
    default: {
      return {
        url: originUrl,
        polling: async () => {
        },
        fillAP: {account: "account", password: "password"}
      };
    }
  }
})(platform);

async function main() {
  if (chromeUrl) {
    const options = new chrome.Options();
    options.setChromeBinaryPath(chromeUrl);
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options.addArguments("--disable-blink-features=AutomationControlled").addArguments("--window-size=1000,1000")).build();
  } else {
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(new chrome.Options().addArguments("--disable-blink-features=AutomationControlled").addArguments("--window-size=1000,1000")).build();
  }
  await driver.get(platform.url || "https://baidu.com");
  let {getStep, setStep} = await definedStepStatus(0);
  if (isFillAP === "true") {
    try {
      await fillAccountPassword(driver, account, password, platform.fillAP);
    } catch (err) {
      console.log('fillAccountPasswordError:', err);
    }
  }
  // 默认 5s
  pollingStatus(driver, getStep, setStep, platform.polling, platform.pollingInterval || 5000);
}

main().catch((err) => {
  console.log('wk_Main:', err);
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  console.log('wk_process_uncaughtException:', err);
  process.exit(0);
});

process.on('message', async (msg) => {
  console.log('wk_processMessage: ', msg);
  await driver.quit().catch(() => {
  });
  if (msg === 'exit') {
    process.exit(0);
  }
})

process.on('exit', () => {
  console.log('wk_processExit');
  if (driver) driver.quit();
})

process.on('SIGINT', () => {
  console.log('wk_processExitSIGINT');
  if (driver) driver.quit();
})

