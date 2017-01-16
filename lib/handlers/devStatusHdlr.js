var helper = require('../helper.js');

module.exports = function (nc, dev, data) {
    var permAddr = helper.buildPermAddr(dev.mac, dev.clientName);

    if (data === 'online') {
    	nc.commitDevIncoming(permAddr, dev);
    } else if (data === 'offline') {   
    	nc.commitDevLeaving(permAddr);
    }
};