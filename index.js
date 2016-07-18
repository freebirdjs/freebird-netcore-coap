var _ = require('busyman'),
    cShepherd = require('coap-shepherd'),
    fbBase = require('freebird-base'),
    Netcore = fbBase.Netcore;

var nc,
    cserver,
    netDrvs = {},
    devDrvs = {},
    gadDrvs = {},
    ipsoDefs = ['dIn', 'dOut', 'aIn', 'aOut', 'generic', 'illuminance', 'presence', 'temperature', 
        'humidity', 'pwrMea', 'actuation', 'setPoint', 'loadCtrl', 'lightCtrl', 'pwrCtrl', 'accelerometer', 
        'magnetometer', 'barometer', 'voltage', 'current', 'frequency', 'depth', 'percentage', 'altitude', 
        'load', 'pressure', 'loudness', 'concentration', 'acidity', 'conductivity', 'power', 'powerFactor', 
        'distance', 'energy', 'direction', 'time', 'gyrometer', 'color', 'gpsLocation', 'positioner', 'buzzer', 
        'audioClip', 'timer', 'addressableTextDisplay', 'onOffSwitch', 'levelControl', 'upDownControl', 
        'multipleAxisJoystick', 'rate', 'pushButton', 'multistateSelector', 'multistateSelector'],
    goodRsp = ['2.00', '2.01', '2.02', '2.03', '2.04', '2.05'];

var coapNc = function () {
    cserver = cShepherd;
    cserver.on('ready', shepherdReadyHdlr);
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
function shepherdReadyHdlr () {
    nc.commitReady();
}

function shepherdEvtHdlr (msg) {
    var data = msg.data,
        dev,
        permAddr,
        oid,
        auxId,
        path,
        gad = {},
        pathArray,
        attrs = {};

    switch(msg.type) {
        case 'registered': 
            dev = data; 
            permAddr = buildPermAddr(dev.mac, dev.clientId);

            dev.observe('device/0');

            nc.commitDevIncoming(permAddr, dev);

            _.forEach(dev.so, function (iObj, okey) {
                if (ipsoDefs.indexOf(okey) >= 0) {
                    oid = okey;
                    _.forEach(iObj, function (resrcs, ikey) {
                        auxId = oid + '/' + ikey;
                        gad = {
                            oid: oid,
                            iid: ikey,
                            resrcs: resrcs
                        };

                        nc.commitGadIncoming(permAddr, auxId, gad);
                    });
                }
            });
            break;

        case 'deregistered':
            break;

        case 'online':
            dev = cserver.find(data);
            permAddr = buildPermAddr(dev.mac, dev.clientId);

            nc.commitDevIncoming(permAddr, dev);
            break;

        case 'offline':
            dev = cserver.find(data);
            permAddr = buildPermAddr(dev.mac, dev.clientId);

            nc.commitDevLeaving(permAddr);
            break;

        case 'update':
            break;

        case 'notify':
            dev = cserver.find(data.device);
            permAddr = buildPermAddr(dev.mac, dev.clientId);
            pathArray = pathSlashParser(data.path);
            auxId = pathArray[0] + '/' + pathArray[1];
            path = auxId + '/' + pathArray[2];
            
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
            break;

        default:
            break;
    }
}

/*************************************************************************************************/
/*** Transform Raw Data Object                                                                 ***/
/*************************************************************************************************/
function cookRawDev (dev, rawDev, callback) { 
    var permAddr = buildPermAddr(rawDev.mac, rawDev.clientId);

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
        classId: cls
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
    if (_.isFunction(mode)) {
        callback = mode;
        mode = null;
    }

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
    findCnode(permAddr, function (err, dev) {
        if (err) {
            callback(err);
        } else {
            cserver.remove(dev.clientName, callback);
        }
    });
};

netDrvs.ping = function (permAddr, callback) {
    findCnode(permAddr, function (err, dev) {
        if (err) {
            callback(err);
        } else {        
            dev.ping(function (err, rsp) {
                callback(err, rsp.data);
            });
        }
    });
};

// Optional
netDrvs.ban = function (permAddr, callback) {
    
};

// Optional
netDrvs.unban = function (permAddr, callback) {
    
};

/*************************************************************************************************/
/*** Device drivers                                                                            ***/
/*************************************************************************************************/
devDrvs.read = function (permAddr, attr, callback) {
    var result = {},
        attrPath = getDevAttrPath(attr);

    findCnode(permAddr, function (err, dev) {
        if (err) {
            callback(err);  
        } else {
            if (attr === 'version' && attrPath) {
                dev.readReq(attrPath, function (err, rsp) {
                    err = err || rspStatusChk(rsp.status);

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
                    err = err || rspStatusChk(rsp.status);

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
                    err = err || rspStatusChk(rsp.status);

                    if (err)
                        callback(err);
                    else 
                        callback(null, rsp.data);
                });
            } else {
                callback(new Error('attr: ' + attr + ' not exist.'));
            }
        }
    });
};

devDrvs.write = function (permAddr, attr, val, callback) {
    var attrPath = getDevAttrPath(attr);

    findCnode(permAddr, function (err, dev) {
        if (err) {
            callback(err);  
        } else {
            if (attrPath) {
                dev.writeReq(attrPath, val, function (err, rsp) {
                    err = err || rspStatusChk(rsp.status);

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
        }
    });
};

// Optional
devDrvs.identify = function (permAddr, callback) {
    callback(null);
};

/*************************************************************************************************/
/*** Gadget drivers                                                                            ***/
/*************************************************************************************************/
gadDrvs.read = function (permAddr, auxId, attr, callback) {
    var path = auxId + '/' + attr;

    findCnode(permAddr, function (err, dev) {
        if (err) {
            callback(err); 
        } else {  
            dev.readReq(path, function(err, rsp) {
                err = err || rspStatusChk(rsp.status);

                if (err) 
                    callback(err);
                else 
                    callback(null, rsp.data);
            });
        }
    });
};

gadDrvs.write = function (permAddr, auxId, attr, val, callback) {
    var path = auxId + '/' + attr;

    findCnode(permAddr, function (err, dev) {
        if (err) {
            callback(err);
        } else { 
            dev.writeReq(path, val, function(err, rsp) {
                err = err || rspStatusChk(rsp.status);

                if (err)
                    callback(err);
                else 
                    callback(null, val);
            });
        }
    });
};

// Optional
gadDrvs.exec = function (permAddr, auxId, attr, args, callback) {
    var path = auxId + '/' + attr;

    if (_.isFunction(args)) {
        callback = args;
        args = [];
    }

    findCnode(permAddr, function (err, dev) {
        if (err) {
            callback(err, false);  
        } else {
            dev.executeReq(path, args, function(err, rsp) {
                err = err || rspStatusChk(rsp.status);

                if (err)
                    callback(err, false);
                else 
                    callback(null, true);
            });
        }
    });
};

// Optional
gadDrvs.setReportCfg = function (permAddr, auxId, attr, cfg, callback) {
    var path = auxId + '/' + attr,
        enable = cfg.enable,
        chkErr = null;

    delete cfg.enable;
    
    function invokeCb(err, cb) {
        if (err)
            cb(err, false);
        else 
            cb(null, true);
    }

    findCnode(permAddr, function (err, dev) {
        if (err) {
            invokeCb(err, callback);  
        } else {
            if (!_.isEmpty(cfg) && enable === true) {
                dev.writeAttrsReq(path, cfg, function (err, rsp) {
                    err = err || rspStatusChk(rsp.status);

                    if (err) {
                        callback(err, false);
                    } else {
                        dev.observeReq(path, function (err, rsp) {
                            err = err || rspStatusChk(rsp.status);

                            invokeCb(err, callback);
                        });
                    }
                });
            } else if (!_.isEmpty(cfg) && enable === false) {
                dev.writeAttrsReq(path, cfg, function (err, rsp) {
                    err = err || rspStatusChk(rsp.status);

                    if (err) {
                        callback(err, false);
                    } else {
                        dev.cancelObserveReq(path, function (err, rsp) {
                            err = err || rspStatusChk(rsp.status);

                            invokeCb(err, callback);
                        });
                    }
                });
            } else if (!_.isEmpty(cfg)) {
                dev.writeAttrsReq(path, cfg, function (err, rsp) {
                    err = err || rspStatusChk(rsp.status);

                    invokeCb(err, callback);
                });
            } else if (_.isEmpty(cfg) && enable === true) {
                dev.observeReq(path, function (err, rsp) {
                    err = err || rspStatusChk(rsp.status);

                    invokeCb(err, callback);
                });
            } else if (_.isEmpty(cfg) && enable === false) {
                dev.cancelObserveReq(path, function (err, rsp) {
                    err = err || rspStatusChk(rsp.status);

                    invokeCb(err, callback);
                });
            }
        }    
    });
};

// Optional
gadDrvs.getReportCfg = function (permAddr, auxId, attr, callback) {
    var path = auxId + '/' + attr;

    findCnode(permAddr, function (err, dev) {
        if (err) {
            callback(err);  
        } else {
            dev.discoverReq(path, function (err, rsp) {
                err = err || rspStatusChk(rsp.status);

                if (err)
                    callback(err);
                else 
                    callback(null, rsp.data.attrs);
            });
        }
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

function rspStatusChk (status) {
    if (goodRsp.indexOf(status) >= 0) {
        return null;
    } else {
        if (status === '4.00') {
            return new Error('status: 4.00, Bad Request.');
        } else if (status === '4.04') {
            return new Error('status: 4.04, Not Found.');
        } else if (status === '4.05') {
            return new Error('status: 4.05, Not Allowed.');
        } else if (status === '4.08') {
            return new Error('status: 4.08, Timeout.');
        } else {
            return new Error('Unknown response status.');
        }
    }
}

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

function buildPermAddr(macAddr, clientId) {
    return macAddr + '/' + clientId;
}

function parsePermAddr (permAddr) {
    var splitAddr = permAddr.split('/');

    return {
        mac: splitAddr[0],
        clientId: splitAddr[1]
    };
}

function findCnode(permAddr, callback) {
    var err,
        cnode,
        cnodes,
        parsedAddr = parsePermAddr(permAddr);

    if (parsedAddr.clientId)
        cnode = cserver._findByClientId(parsedAddr.clientId);

    if (cnode) {
        callback(null, cnode);
        return;
    } else {
        cnodes = cserver._findByMacAddr(parsedAddr.mac);

        if (cnodes.length === 0)
            err = new Error('No such item of permAddr: ' + permAddr);
        else if (cnodes.length !== 1)
            err = new Error('Ambiguous address, multiple targets found.');
        else
            cnode = cnodes[0];            
    }

    callback(err, cnode);
}

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

module.exports = coapNc();
