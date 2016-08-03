var CNST = require('./constants');

var helper = {};

helper.buildPermAddr = function (macAddr, clientName) {
    return macAddr + '/' + clientName;
};

helper.parsePermAddr = function (permAddr) {
    var splitAddr = permAddr.split('/');

    return {
        mac: splitAddr[0],
        clientName: splitAddr[1]
    };
};

helper.pathSlashParser = function (path) {       // '/x/y/z'
    var pathArray = path.split('/');       

    if (pathArray[0] === '') 
        pathArray = pathArray.slice(1);

    if (pathArray[pathArray.length-1] === '')           
        pathArray = pathArray.slice(0, pathArray.length-1);

    return pathArray;  // ['x', 'y', 'z']
};

helper.rspStatusChk = function (status) {
    if (CNST.goodRsp.indexOf(status) >= 0) {
        return null;
    } else {
        if (status === '4.00') {
            return new Error('status: 4.00, Bad Request.');
        } else if (status === '4.04') {
            return new Error('status: 4.04, Not Found.');
        } else if (status === '4.05') {
            return new Error('status: 4.05, Not Allowed.');
        } else if (status === '4.08') {
            return new Error('status: 4.08, Timeout.');
        } else {
            return new Error('Unknown response status.');
        }
    }
};

module.exports = helper;
