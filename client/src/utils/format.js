export const  formatNum = (num, fixed) => {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toFixed(fixed).toString().match(re)[0];
}