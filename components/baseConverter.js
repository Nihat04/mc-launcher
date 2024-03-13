const base64 = require("base-64");
const utf8 = require("utf8");


function convertBaseToUtf(str) {
    const strBytes = base64.decode(str);
    const res = utf8.decode(strBytes);
    return res;
}

function convertUtfToBase(str) {
    const strBytes = utf8.encode(str);
    const res = base64.encode(strBytes);
    return res;
}

module.exports = { convertBaseToUtf, convertUtfToBase };