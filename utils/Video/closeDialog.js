const {By} = require("selenium-webdriver");

module.exports = async (driver) => {
  let vModal = (await driver.findElements(By.className('v-modal')))[0];
  if ((await vModal.getAttribute('style')).indexOf('display: none') === -1) {
    await driver.executeScript((vModal) => {
      vModal.style.display = 'none';
    }, vModal);
  }
  let warnDialog = (await driver.findElements(By.className('el-dialog__wrapper dialog-warn')))[0];
  if ((await warnDialog.getAttribute('style')).indexOf('display: none') === -1) {
    await driver.executeScript((warnDialog, vModal) => {
      vModal.style.display = 'none';
      warnDialog.style.display = 'none';
    }, warnDialog, vModal);
  }
  let testDialog = (await driver.findElements(By.className('el-dialog__wrapper dialog-test')))[0];
  if (testDialog && (await testDialog.getAttribute('style')).indexOf('display: none') === -1) {
    await driver.executeScript((testDialog, vModal) => {
      vModal.style.display = 'none';
      testDialog.style.display = 'none';
    }, testDialog, vModal);
  }
  let dialog = (await driver.findElements(By.className('dialog')))[1];
  if ((await dialog.getAttribute('style')).indexOf('display: none') === -1) {
    await driver.executeScript((dialog, vModal) => {
      vModal.style.display = 'none';
      dialog.style.display = 'none';
    }, dialog, vModal);
  }
}