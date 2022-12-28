const gankVideo = require("./Video/gankVideo.js");

module.exports = async function(driver, current_url, getStep, setStep) {
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
