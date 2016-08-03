var _ = require('busyman');

var helper = require('../helper.js');

function read (permAddr, attr, callback) {
    var shepherd = this,
        realAddr = helper.parsePermAddr(permAddr),
        dev = shepherd.find(realAddr.clientName),
        attrPath = getDevAttrPath(attr),
        result = {},
        err = null;

    if (dev) {
        if (attr === 'version' && attrPath) {
            dev.readReq(attrPath, function (err, rsp) {
                err = err || helper.rspStatusChk(rsp.status);

                if (err) {
                    callback(err);
                } else {
                    result.fw = rsp.data.firmware;
                    result.hw = rsp.data.hwVer;
                    result.sw = rsp.data.swVer;
                    callback(null, result);
                }
            });
        } else if (attr === 'power' && attrPath) {
            dev.readReq(attrPath, function (err, rsp) {
                err = err || helper.rspStatusChk(rsp.status);

                if (err) {
                    callback(err);
                } else {
                    result.type = value.availPwrSrc;
                    result.voltage = value.pwrSrcVoltage;
                    callback(null, result);
                }
            });
        } else if (attrPath) {
            dev.readReq(attrPath, function (err, rsp) {
                err = err || helper.rspStatusChk(rsp.status);

                if (err)
                    callback(err);
                else 
                    callback(null, rsp.data);
            });
        } else {
            callback(new Error('attr: ' + attr + ' not exist.'));
        }
    } else {
        callback(new Error('Device not found.'));
    }
}

function write (permAddr, attr, val, callback) {
    var shepherd = this,
        realAddr = helper.parsePermAddr(permAddr),
        dev = shepherd.find(realAddr.clientName),
        attrPath = getDevAttrPath(attr),
        err = null;

    if (dev) {
        if (attrPath) {
            dev.writeReq(attrPath, val, function (err, rsp) {
                err = err || helper.rspStatusChk(rsp.status);

                if (_.isFunction(callback)) {
                    if (err)
                        callback(err);
                    else
                        callback(null, val);
                }
            });
        } else {
            callback(new Error('attr: ' + attr + ' not exist.'));
        }
    } else {
        callback(new Error('Device not found.'));
    }
}

// Optional
function identify (permAddr, callback) {

}

/*************************************************************************************************/
/*** Private Functions                                                                         ***/
/*************************************************************************************************/
function getDevAttrPath(attr) {
    var attrPath;

    switch (attr) {
        case 'manufacturer':
            attrPath = 'device/0/manuf';
            break;
        case 'model':
            attrPath = 'device/0/model';
            break;
        case 'serial':
            attrPath = 'device/0/serial';
            break;
        case 'fw':
        case 'version.fw':
            attrPath = 'device/0/firmware';
            break;
        case 'hw':
        case 'version.hw':
            attrPath = 'device/0/hwVer';
            break;
        case 'sw':
        case 'version.sw':
            attrPath = 'device/0/swVer';
            break;
        case 'version':
            attrPath = 'device/0';
            break;
        case 'type':
        case 'power.type':
            attrPath = 'device/0/availPwrSrc';
            break;
        case 'voltage':
        case 'power.voltage':
            attrPath = 'device/0/pwrSrcVoltage';
            break;
        case 'power':
            attrPath = 'device/0';
            break;
        default:
            attrPath = undefined;
            break;
    }

    return attrPath;
}

module.exports = {
    read: read,
    write: write,
    identify: identify,       // no need to implement
};