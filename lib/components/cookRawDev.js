var helper = require('../helper');

module.exports = function (dev, rawDev, callback) {
    var permAddr = helper.buildPermAddr(rawDev.mac, rawDev.clientId);

    dev.setNetInfo({
        role: null,
        parent: '0',
        maySleep: false,
        address: { permanent: permAddr, dynamic: rawDev.ip },
    });

    dev.setAttrs({
        manufacturer: rawDev.so.device[0].manuf,
        model: rawDev.so.device[0].model,
        serial: rawDev.so.device[0].serial,
        version: {
            fw: rawDev.so.device[0].firmware,
            hw: rawDev.so.device[0].hwVer,
            sw: rawDev.so.device[0].swVer
        },
        power: {
            type: rawDev.so.device[0].availPwrSrc,
            voltage: rawDev.so.device[0].pwrSrcVoltage
        }
    });

    callback(null, dev);
};