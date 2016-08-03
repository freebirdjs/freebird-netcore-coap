var helper = require('../helper.js');

module.exports = function (nc, dev) {
    var permAddr = helper.buildPermAddr(dev.mac, dev.clientName);
    
    nc.commitDevLeaving(permAddr);
};