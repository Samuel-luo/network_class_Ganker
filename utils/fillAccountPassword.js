const {By} = require("selenium-webdriver");

// 自动填充账号密码
module.exports = async (driver, account, password) => {
  await driver.findElement(By.id('lUsername')).sendKeys(account || '');
  await driver.findElement(By.id('lPassword')).sendKeys(password || '');
}