const {By} = require("selenium-webdriver");

module.exports = async (driver) => {
  let list = [];
  let allElem = await driver.findElements(By.className('clearfix video'));
  for (let item of allElem) {
    if (!(await item.findElements(By.className('fl time_icofinish'))).length) {
      list.push(item);
    }
  }
  if (!list.length) {
    console.log('this class is done');
    await driver.navigate().back();
    return false;
  } else if ((await list[0].findElements(By.className('progress-num'))).length) {
    console.log('this video is playing...');
  } else {
    await list[0].click();
  }
  return true;
}