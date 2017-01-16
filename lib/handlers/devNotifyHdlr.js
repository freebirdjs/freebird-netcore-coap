var _ = require('busyman');

var helper = require('../helper.js');

module.exports = function (nc, dev, data) {
    var permAddr = helper.buildPermAddr(dev.mac, dev.clientName),
        pathArray = helper.pathSlashParser(data.path),
        auxId = pathArray[0] + '/' + pathArray[1],
        path = auxId + '/' + pathArray[2],
        attrs = {};
    
    if (pathArray.length === 2) {
        attrs = data.value;
    } else if (pathArray.length === 3) {
        attrs[pathArray[2]] = data.value;
    }

    if (auxId === 'device/0') {
        attrs = getDevAttr(attrs);
        nc.commitDevReporting(permAddr, attrs);
    } else {
        nc.commitGadReporting(permAddr, auxId, attrs);
    }
};

/*************************************************************************************************/
/*** Private Functions                                                                         ***/
/*************************************************************************************************/
function getDevAttr(attrs) {
    var devAttr = {};

    devAttr.version = {};
    devAttr.power = {};

    _.forEach(attrs, function (val, key) {
        if (key === 'manuf') {
            devAttr.manufacturer = val;
        } else if (key === 'model') {
            devAttr.model = val;
        } else if (key === 'serial') {
            devAttr.serial = val;
        } else if (key === 'firmware') {
            devAttr.version.fw = val;
        } else if (key === 'hwVer') {
            devAttr.version.hw = val;
        } else if (key === 'swVer') {
            devAttr.version.sw = val;
        } else if (key === 'availPwrSrc') {
            devAttr.power.type = val;
        } else if (key === 'pwrSrcVoltage') {
            devAttr.power.voltage = val;
        }
    });

    return devAttr;
}
