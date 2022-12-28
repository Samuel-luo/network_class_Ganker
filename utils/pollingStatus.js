// 轮询当前页面状态，状态为 3 退出轮询
module.exports = (driver, getStep, setStep, polling) => {
  setInterval(() => {
    if (getStep() === 3) process.exit(0);
    pollingFn(driver, getStep, setStep, polling).catch((err) => {
      console.log('pollingStateError:', err);
      process.exit(0);
    })
  }, 5000);
}

const pollingFn = async (driver, getStep, setStep, polling) => {
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
  await polling(driver, current_url, getStep, setStep);
}