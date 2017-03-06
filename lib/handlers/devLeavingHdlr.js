var helper = require('../helper.js');

module.exports = function (nc, dev, data) {
    var permAddr = helper.buildPermAddr(data, dev);
    
    nc.commitDevLeaving(permAddr);
};