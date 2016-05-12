var _ = require('lodash'),
    cShepherd = require('coap-shepherd'),
    fbBase = require('freebird-base'),
    Netcore = fbBase.Netcore;

var nc,
    cserver,
    netDrvs = {},
    devDrvs = {},
    gadDrvs = {},
    ipsoDefs = ['dIn', 'dOut', 'aIn', 'aOut', 'generic', 'illuminance', 'presence', 'temperature',
        'humidity', 'pwrMea', 'actuation', 'setPoint', 'loadCtrl', 'lightCtrl', 'pwrCtrl', 
        'accelerometer', 'magnetometer', 'barometer'],
    goodReq = ['2.00', '2.01', '2.02', '2.03', '2.04', '2.05'];

var coapNc = function () {
    cserver = cShepherd;
    cserver.on('ind', shepherdEvtHdlr);

    nc = new Netcore('coapcore', cserver, {phy: 'coap', nwk: 'coap'});
    nc.cookRawDev = cookRawDev;
    nc.cookRawGad = cookRawGad;

    nc.registerNetDrivers(netDrvs);
    nc.registerDevDrivers(devDrvs);
    nc.registerGadDrivers(gadDrvs);

    return nc;
};

/*************************************************************************************************/
/*** Shepherd Event Handlers                                                                   ***/
/*************************************************************************************************/
function shepherdEvtHdlr (msg) {
    var data = msg.data,
        dev,
        oid,
        auxId,
        path,
        gad = {},
        pathArray,
        attrs = {};

    switch(msg.type) {
        case 'registered':
            _.forEach(data.so, function (iObj, okey) {
                oid = okey;
                _.forEach(iObj, function (resrcs, ikey) {
                    auxId = oid + '/' + ikey;
                    gad = {
                        oid: oid,
                        iid: ikey,
                        resrcs: resrcs
                    };

                    nc.commitGadIncoming(data.mac, auxId, gad);
                });
            });
            break;

        case 'deregistered':
            break;

        case 'online':
            dev = cserver.find(data);
            nc.commitDevIncoming(dev.mac, dev);
            break;

        case 'offline':
            dev = cserver.find(data);
            nc.commitDevLeaving(dev.mac);
            break;

        case 'update':
            break;

        case 'notify':
            dev = cserver.find(data.device);
            pathArray = pathSlashParser(data.path);
            auxId = pathArray[0] + '/' + pathArray[1],
            path = auxId + '/' + pathArray[2];
            
            if (pathArray.length === 2) {
                attrs = data.value;
            } else if (pathArray.length === 3) {
                attrs[pathArray[2]] = data.value;
            }

            if (auxId === 'device/0') {
                nc.commitDevReporting(dev.mac, attrs);
            } else {
                nc.commitGadReporting(dev.mac, auxId, attrs);
            }
            break;

        default:
            break;
    }
}

/*************************************************************************************************/
/*** Transform Raw Data Object                                                                 ***/
/*************************************************************************************************/
function cookRawDev (dev, rawDev, callback) { 
    var netInfo = {
            role: null,
            parent: '0',
            maySleep: false,
            address: { permanent: rawDev.mac, dynamic: rawDev.ip },
        },
        attrs = {
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
        };

    dev.setNetInfo(netInfo);
    dev.setAttrs(attrs);

    callback(null, dev);
}

function cookRawGad (gad, rawGad, callback) { 
    var cls;

    if (ipsoDefs.indexOf(rawGad.oid) >= 0) {
        cls = rawGad.oid;
    } else {
        cls = 'generic';
    }

    gad.setPanelInfo({
        profile: null,
        class: cls
    });

    gad.setAttrs(rawGad.resrcs);

    callback(null, gad);
}

/*************************************************************************************************/
/*** Netcore drivers                                                                           ***/
/*************************************************************************************************/
netDrvs.start = function (callback) {
    cserver.start(callback);
};

netDrvs.stop = function (callback) {
    cserver.stop(callback);
};

netDrvs.reset = function (mode, callback) {
    cserver.reset(callback);
};

netDrvs.permitJoin = function (duration, callback) {
    try {
        cserver.permitJoin(duration);
        callback(null);
    } catch (e) {
        callback(e);
    }
};

netDrvs.remove = function (permAddr, callback) {
    var dev = cserver._findByMac(permAddr),
        clientName = dev.clientName;

    cserver.remove(clientName, callback);
};

netDrvs.ping = function (permAddr, callback) {
    var dev = cserver._findByMac(permAddr);

    dev.ping(function (err, rsp) {
        callback(err, rsp.data);
    });
};

// Optional
netDrvs.ban = function (permAddr, callback) {
    var dev = cserver._findByMac(permAddr);

    
};

// Optional
netDrvs.unban = function (permAddr, callback) {
    var dev = cserver._findByMac(permAddr);

    
};

/*************************************************************************************************/
/*** Device drivers                                                                            ***/
/*************************************************************************************************/
devDrvs.read = function (permAddr, attr, callback) {
    var dev = cserver._findByMac(permAddr),
        result = {},
        attrPath;

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
            attrPath = 'device/0/firmware';
            break;
        case 'hw':
            attrPath = 'device/0/hwVer';
            break;
        case 'sw':
            attrPath = 'device/0/swVer';
            break;
        case 'version':
            attrPath = 'device/0';
            break;
        case 'type':
            attrPath = 'device/0/availPwrSrc';
            break;
        case 'voltage':
            attrPath = 'device/0/pwrSrcVoltage';
            break;
        case 'power':
            attrPath = 'device/0';
            break;
        default:
            break;
    }

    if (attr === 'version' && attrPath) {
        dev.read(attrPath, function (err, rsp) {
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
        dev.read(attrPath, function (err, rsp) {
            if (err) {
                callback(err);
            } else {
                result.type = value.availPwrSrc;
                result.voltage = value.pwrSrcVoltage;
                callback(null, result);
            }
        });
    } else if (attrPath) {
        dev.read(attrPath, function (err, rsp) {
            callback(err, rsp.data);
        });
    } else {
        callback(new Error('attr: ' + attr + ' not exist.'));
    }
};

devDrvs.write = function (permAddr, attr, val, callback) {
    var dev = cserver._findByMac(permAddr),
        attrPath;

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
            attrPath = 'device/0/firmware';
            break;
        case 'hw':
            attrPath = 'device/0/hwVer';
            break;
        case 'sw':
            attrPath = 'device/0/swVer';
            break;
        case 'version':
            attrPath = 'device/0';
            break;
        case 'type':
            attrPath = 'device/0/availPwrSrc';
            break;
        case 'voltage':
            attrPath = 'device/0/pwrSrcVoltage';
            break;
        case 'power':
            attrPath = 'device/0';
            break;
        default:
            break;
    }
        
    if (attrPath) {
        dev.write(attrPath, val, function (err, rsp) {
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
};

// Optional
devDrvs.identify = function (permAddr, callback) {
    callback(null);
};

/*************************************************************************************************/
/*** Gadget drivers                                                                            ***/
/*************************************************************************************************/
gadDrvs.read = function (permAddr, auxId, attr, callback) {
    var dev = cserver._findByMac(permAddr),
        path = auxId + '/' + attr;

    dev.read(path, function(err, rsp) {
        callback(err, rsp.data);
    });
};

gadDrvs.write = function (permAddr, auxId, attr, val, callback) {
    var dev = cserver._findByMac(permAddr),
        path = auxId + '/' + attr;

    dev.write(path, val, function(err, rsp) {
        if (err)
            callback(err);
        else 
            callback(null, val);
    });
};

// Optional
gadDrvs.exec = function (permAddr, auxId, attr, args, callback) {
    var dev = cserver._findByMac(permAddr),
        path = auxId + '/' + attr;

    if (_.isFunction(args)) {
        callback = args;
        args = [];
    }

    dev.execute(path, args, function(err, rsp) {
        callback(err);
    });
};

// Optional
gadDrvs.setReportCfg = function (permAddr, auxId, attr, cfg, callback) {
    var dev = cserver._findByMac(permAddr),
        path = auxId + '/' + attr,
        enable = cfg.enable,
        chkErr = null;

    delete cfg.enable;

    
    if (!_.isEmpty(cfg) && enable === true) {
        dev.writeAttrs(path, cfg, function (err, rsp) {
            if (err) {
                callback(err);
            } else {
                dev.observe(path, function (err, rsp) {
                    callback(err, reqStatusChk(rsp.status));
                });
            }
        });
        
    } else if (!_.isEmpty(cfg) && enable === false) {
        dev.writeAttrs(path, cfg, function (err, rsp) {
            if (err) {
                callback(err);
            } else {
                dev.cancelObserve(path, function (err, rsp) {
                    callback(err, reqStatusChk(rsp.status));
                });
            }
        });
    } else if (!_.isEmpty(cfg)) {
        dev.writeAttrs(path, cfg, function (err, rsp) {
            callback(err, reqStatusChk(rsp.status));
        });
    } else if (_.isEmpty(cfg) && enable === true) {
        dev.observe(path, function (err, rsp) {
            callback(err, reqStatusChk(rsp.status));
        });
    } else if (_.isEmpty(cfg) && enable === false) {
        dev.cancelObserve(path, function (err, rsp) {
            callback(err, reqStatusChk(rsp.status));
        });
    }
};

// Optional
gadDrvs.getReportCfg = function (permAddr, auxId, attr, callback) {
    var dev = cserver._findByMac(permAddr),
        path = auxId + '/' + attr;

    dev.discover(path, function (err, rsp) {
        callback(err, rsp.data.attrs);
    });
};

/*************************************************************************************************/
/*** Private Functions                                                                         ***/
/*************************************************************************************************/
function pathSlashParser (path) {       // '/x/y/z'
    var pathArray = path.split('/');       

    if (pathArray[0] === '') 
        pathArray = pathArray.slice(1);

    if (pathArray[pathArray.length-1] === '')           
        pathArray = pathArray.slice(0, pathArray.length-1);

    return pathArray;  // ['x', 'y', 'z']
}

function reqStatusChk (status) {
    if (goodReq.indexOf(status) >= 0) {
        return true;
    } else {
        return false;
    }
}

module.exports = coapNc();
