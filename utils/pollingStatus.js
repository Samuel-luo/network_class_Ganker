const gankVideo = require('./Video/gankVideo.js');

// 轮询当前页面状态
module.exports = (driver, getStep, setStep) => {
  setInterval(() => {
    pollingFn(driver, getStep, setStep).catch((err) => {
      console.log('pollingStateError:', err);
      process.exit(0);
    })
  }, 8000);
}

const pollingFn = async (driver, getStep, setStep) => {
  let allWindowHandles = await driver.getAllWindowHandles().catch(() => {
    process.exit(0)
  });
  let latestWindowHandle = allWindowHandles[allWindowHandles.length - 1];
  // console.log(allWindowHandles);

  let nowWindowHandle = await driver.getWindowHandle().catch(async () => {
    // 窗口退出后自动匹配到最新窗口
    await driver.switchTo().window(latestWindowHandle);
    return latestWindowHandle;
  });
  // console.log(nowWindowHandle);

  let current_url = await driver.getCurrentUrl();
  // console.log(current_url);

  // 切换当前窗口
  if (latestWindowHandle !== nowWindowHandle) {
    await driver.switchTo().window(latestWindowHandle);
  }

  // 切换当前模式
  if (/https:\/\/studyvideoh5.zhihuishu.com\/stuStudy\?recruitAndCourseId=.*/.test(current_url)) {
    setStep(1);
    try {
      await gankVideo(driver);
    } catch (err) {
      console.log('gankVideoError:', err);
    }
  } else if (/https:\/\/onlineexamh5new.zhihuishu.com\/stuExamWeb.html#\/webExamList\/dohomework/.test(current_url)) {
    setStep(2);
  } else {
    setStep(0);
  }
}