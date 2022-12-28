const gankCheck = require("./gankCheck.js");

module.exports = async function (driver, current_url, getStep, setStep) {
  if (/http:\/\/pt\.1000phone\.com\/livingRoom\?classroomId=.*/.test(current_url)) {
    setStep(getStep() || 1);
    try {
      await gankCheck(driver, getStep, setStep);
    } catch (err) {
      console.log('gankCheckError:', err);
    }
  } else {
    setStep(0);
  }
}
