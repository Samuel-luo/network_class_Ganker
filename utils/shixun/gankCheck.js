const {By} = require("selenium-webdriver");

module.exports = async function (driver, getStep, setStep) {
  try {
    if (getStep() < 2) {
      let iframes = await driver.findElements(By.tagName('iframe'));
      if (!iframes || !iframes.length) return;
      await driver.switchTo().frame(iframes[0]);
      console.log("进入 iframe");
      setStep(2);
    }
    let mediaContent = await driver.findElements(By.className('c-watch__main'))
    if (!mediaContent || !mediaContent.length) {
      await driver.switchTo().defaultContent();
      setStep(1);
      console.log("页面可能有变化，返回上一层");
    }
    let buttons = await driver.findElements(By.className('pws-vclass-btn--primary'));
    if (!buttons || !buttons.length) return;
    let i = 0;
    while (i < buttons.length) {
      if ((await buttons[i].getAttribute("innerText")).trim() === "立即签到") {
        if (!await buttons[i].isDisplayed() || !await buttons[i].isEnabled()) return;
        await buttons[i].click();
        console.log("点击了一次签到");
      }
      i++;
    }
  } catch (err) {
    console.log("捕获错误: ", err);
  }
}