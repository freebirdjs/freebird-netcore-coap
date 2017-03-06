var helper = require('../helper.js');

module.exports = function (nc, dev, data) {
    var permAddr = helper.buildPermAddr(dev.mac, dev.clientName);
    
    nc.commitDevNetChanging(permAddr, data);
};