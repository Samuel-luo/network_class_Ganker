const variableMap = {};
const blankFn = () => {};

module.exports = async (value, callBack = blankFn) => {
  let id = new Date().getTime();
  variableMap[id] = value;

  return {
    getStep: () => {
      return variableMap[id];
    },
    setStep: (newVal) => {
      let oldVal = variableMap[id];
      if (oldVal !== newVal) {
        variableMap[id] = newVal;
        callBack(oldVal, newVal);
      }
      return newVal;
    }
  }
}