const {By} = require("selenium-webdriver");

module.exports = async function (driver, getStep, setStep) {
  try {
    if (getStep() < 2) {
      let iframes = await driver.findElements(By.tagName('iframe'));
      if (!iframes || !iframes.length) throw "没有成功加载页面"
      await driver.switchTo().frame(iframes[0]);
      console.log("进入 iframe");
      setStep(2);
    }
    let buttons = await driver.findElements(By.className('plv-iar-btn-default pws-btn-bg-color pws-vclass-btn--primary'))
    if (!buttons || !buttons.length) throw "没有检测到按钮"
    await buttons[0].click();
  } catch (err) {
    console.log("还没有进行签到呢: ", typeof err === "string" ? err : "嘿嘿");
  }
}