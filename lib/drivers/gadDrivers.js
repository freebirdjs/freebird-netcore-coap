var _ = require('busyman');

var helper = require('../helper.js');

function read (permAddr, auxId, attr, callback) {
    var shepherd = this,
        realAddr = helper.parsePermAddr(permAddr),
        dev = shepherd.find(realAddr.clientName),
        path = auxId + '/' + attr,
        err = null;

    if (dev) {  
        dev.readReq(path, function(err, rsp) {
            err = err || helper.rspStatusChk(rsp.status);

            if (err) 
                callback(err);
            else 
                callback(null, rsp.data);
        });
    } else {
        callback(new Error('Device not found.'));
    }
}

function write (permAddr, auxId, attr, val, callback) {
    var shepherd = this,
        realAddr = helper.parsePermAddr(permAddr),
        dev = shepherd.find(realAddr.clientName),
        path = auxId + '/' + attr,
        err = null;

    if (dev) { 
        dev.writeReq(path, val, function(err, rsp) {
            err = err || helper.rspStatusChk(rsp.status);

            if (err)
                callback(err);
            else 
                callback(null, val);
        });
    } else {
        callback(new Error('Device not found.'));
    }
}

// Optional
function exec (permAddr, auxId, attr, args, callback) {
    var shepherd = this,
        realAddr = helper.parsePermAddr(permAddr),
        dev = shepherd.find(realAddr.clientName),
        path = auxId + '/' + attr,
        err = null;

    if (_.isFunction(args)) {
        callback = args;
        args = [];
    }

    if (dev) {
        dev.executeReq(path, args, function(err, rsp) {
            err = err || helper.rspStatusChk(rsp.status);

            if (err)
                callback(err, false);
            else 
                callback(null, true);
        });
    } else {
        callback(new Error('Device not found.'));
    }
}

// Optional
function setReportCfg (permAddr, auxId, attr, cfg, callback) {
    var shepherd = this,
        realAddr = helper.parsePermAddr(permAddr),
        dev = shepherd.find(realAddr.clientName),
        path = auxId + '/' + attr,
        enable = cfg.enable,
        err = null;

    delete cfg.enable;
    
    function invokeCb(e, cb) {
        if (e)
            cb(e, false);
        else 
            cb(null, true);
    }

    if (dev) {
        if (!_.isEmpty(cfg) && enable === true) {
            dev.writeAttrsReq(path, cfg, function (err, rsp) {
                err = err || helper.rspStatusChk(rsp.status);

                if (err) {
                    callback(err, false);
                } else {
                    dev.observeReq(path, function (err, rsp) {
                        err = err || helper.rspStatusChk(rsp.status);

                        invokeCb(err, callback);
                    });
                }
            });
        } else if (!_.isEmpty(cfg) && enable === false) {
            dev.writeAttrsReq(path, cfg, function (err, rsp) {
                err = err || helper.rspStatusChk(rsp.status);

                if (err) {
                    callback(err, false);
                } else {
                    dev.cancelObserveReq(path, function (err, rsp) {
                        err = err || helper.rspStatusChk(rsp.status);

                        invokeCb(err, callback);
                    });
                }
            });
        } else if (!_.isEmpty(cfg)) {
            dev.writeAttrsReq(path, cfg, function (err, rsp) {
                err = err || helper.rspStatusChk(rsp.status);

                invokeCb(err, callback);
            });
        } else if (_.isEmpty(cfg) && enable === true) {
            dev.observeReq(path, function (err, rsp) {
                err = err || helper.rspStatusChk(rsp.status);

                invokeCb(err, callback);
            });
        } else if (_.isEmpty(cfg) && enable === false) {
            dev.cancelObserveReq(path, function (err, rsp) {
                err = err || helper.rspStatusChk(rsp.status);

                invokeCb(err, callback);
            });
        }
    } else {
        callback(new Error('Device not found.'));
    }
}

// Optional
function getReportCfg (permAddr, auxId, attr, callback) {
    var shepherd = this,
        realAddr = helper.parsePermAddr(permAddr),
        dev = shepherd.find(realAddr.clientName),
        path = auxId + '/' + attr,
        err = null;

    if (dev) {
        dev.discoverReq(path, function (err, rsp) {
            err = err || helper.rspStatusChk(rsp.status);

            if (err)
                callback(err);
            else 
                callback(null, rsp.data.attrs);
        });
    } else {
        callback(new Error('Device not found.'));
    }
}


module.exports = {
    read: read,
    write: write,
    exec: exec,
    setReportCfg: setReportCfg,
    getReportCfg: getReportCfg
};
