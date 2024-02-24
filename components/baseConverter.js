const base64 = require("base-64");
const utf8 = require("utf8");


function convertBaseToUtf(str) {
    console.log(str);
    const strBytes = base64.decode(str);
    const res = utf8.decode(strBytes);
    console.log(res);
    return res;
}

function convertUtfToBase(str) {
    console.log(str);
    const strBytes = utf8.encode(str);
    const res = base64.encode(strBytes);
    console.log(res);
    return res;
}

module.exports = { convertBaseToUtf, convertUtfToBase };