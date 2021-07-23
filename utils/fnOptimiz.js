const debounce = function (fn, delay, immediate) {
  // 维护一个 timer
  let timer = null;
  return function () {
    // 通过 ‘this’ 和 ‘arguments’ 获取函数的作用域和变量
    let context = this;
    let args = arguments;
    if (timer) clearTimeout(timer);
    if (immediate) {
      var callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, delay)
      if (callNow) fn.apply(context, args)
    }
    else {
      timer = setTimeout(function(){
          fn.apply(context, args)
        }, delay);
    }
  }
}
const throttle = function (func, delay) {
  var timer = null;
  return function () {
    var context = this;
    var args = arguments;
    if (!timer) {
      timer = setTimeout(function () {
        func.apply(context, args);
        timer = null;
      }, delay);
    }
  }
}
const doubleClick = function (func, delay = 400) {
  var timer = null;
  var lastTime = 0;
  return function () {
    var curTime = Date.now();
    var distance = curTime - lastTime;
    var remaining = distance > 0 && delay > distance;
    var context = this;
    var args = arguments;
    if (remaining) {
      func.apply(context, args);
      lastTime = 0;
    } else {
      lastTime = Date.now();
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      lastTime = 0
    }, delay);
  }
}
module.exports = {debounce, throttle, doubleClick}