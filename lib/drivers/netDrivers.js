var _ = require('busyman');

var helper = require('../helper.js');

function start (callback) {
    var shepherd = this;
    
    shepherd.start(callback);
}

function stop (callback) {
    var shepherd = this;
    
    shepherd.stop(callback);
}

function reset (mode, callback) {
    var shepherd = this;
    
    if (_.isFunction(mode)) {
        callback = mode;
        mode = null;
    }

    shepherd.reset(callback);
}

function permitJoin (duration, callback) {
    var shepherd = this;
    
    try {
        shepherd.permitJoin(duration);
        callback(null);
    } catch (e) {
        callback(e);
    }
}

function remove (permAddr, callback) {
    var shepherd = this,
        realAddr = helper.parsePermAddr(permAddr);

    shepherd.remove(realAddr.clientName, callback);
}

function ping (permAddr, callback) {
    var shepherd = this,
        realAddr = helper.parsePermAddr(permAddr),
        dev = shepherd.find(realAddr.clientName);
    
    if (dev) {        
        dev.pingReq(function (err, rsp) {
            callback(err, rsp.data);
        });
    } else {
        callback(new Error('Device not found.'));
    }
}

// Optional
function ban (permAddr, callback) {
    callback();
}

// Optional
function unban (permAddr, callback) {
    callback();
}

module.exports = {
    start: start,
    stop: stop,
    reset: reset,
    permitJoin: permitJoin,
    remove: remove,
    ping: ping,
    ban: ban,       // no need to implement
    unban: unban    // no need to implement
};