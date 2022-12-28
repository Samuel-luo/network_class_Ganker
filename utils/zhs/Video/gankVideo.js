const {By, until} = require("selenium-webdriver");
const closeDialog = require('./closeDialog.js');
const playLatestVideo = require('./playLatestVideo.js');

module.exports = async (driver) => {
  // 等待页面加载完成
  await driver.wait(until.elementLocated(By.id('playButton')));
  // 去除弹窗
  await closeDialog(driver);
  // 确认当前的播放内容
  if (!await playLatestVideo(driver)) {
    return;
  }


  // 开始播放
  let playButton = await driver.findElement(By.id('playButton'));
  if ((await playButton.getAttribute('class')).indexOf('playButton') !== -1) {
    let controlsBar = (await driver.findElements(By.className('controlsBar')))[0];
    let volumeBox = (await driver.findElements(By.className('volumeBox')))[0];
    let muteButton = (await driver.findElements(By.className('volumeIcon')))[0];
    let speedBox = (await driver.findElements(By.className('speedBox')))[0];
    let speedButton = (await driver.findElements(By.className('speedTab speedTab15')))[0];
    await driver.executeScript((controlsBar) => {
      controlsBar.style.display = 'block';
    }, controlsBar);
    if ((await volumeBox.getAttribute('class')).indexOf('volumeNone') === -1) await muteButton.click();
    await driver.executeScript((controlsBar) => {
      controlsBar.style.display = 'block';
    }, controlsBar);
    await speedBox.click();
    await driver.executeScript((controlsBar) => {
      controlsBar.style.display = 'block';
    }, controlsBar);
    await speedButton.click();
    await driver.executeScript((controlsBar) => {
      controlsBar.style.display = 'block';
    }, controlsBar);
    await playButton.click();
  } else {
    console.log('already playing');
  }
}