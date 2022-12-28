const {By} = require("selenium-webdriver");

// 自动填充账号密码
module.exports = async (driver, account, password, inputIds) => {
  if (inputIds) {
    await driver.findElement(By.id(inputIds.account)).sendKeys(account || '');
    await driver.findElement(By.id(inputIds.password)).sendKeys(password || '');
  }
}