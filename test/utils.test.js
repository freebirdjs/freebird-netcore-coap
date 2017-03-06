var fs = require('fs'),
    path = require('path'),
    _ = require('busyman'),
    should = require('should'),
    Netcore = require('freebird-base').Netcore,
    Device = require('freebird-base').Device,
    Gadget = require('freebird-base').Gadget,
    CoapNode = require('coap-node'),
    SmartObject = require('smartobject');

var so1 = new SmartObject(),
    so2 = new SmartObject(),
    so3 = new SmartObject();

/**********************************************************************/
/* coapNode1 init resource                                            */
/**********************************************************************/
so1.init('temperature', 0, {
    sensorValue: 21,
    units: 'C',
    5702: { 
        read: function (cb) {
            var time = new Date();
            cb(null, time.toString());
        }
    },
    5703: { 
        write: function (val, cb) {
            console.log('write ' + val);
            cb(null, val);
        }
    },
    5704: { 
        exec: function (val1, val2, cb) {
            console.log(val1 + ': Hello ' + val2 + '!');
            cb(null);
        }
    }
});

so1.init('temperature', 1, {
    5700: 70,
    5701: 'F',
    5703: 70
});

/**********************************************************************/
/* coapNode2 init resource                                            */
/**********************************************************************/
so2.init('humidity', 0, {
    sensorValue: 56,
    units: '%',
    5703: 56
});

/**********************************************************************/
/* coapNode3 init resource                                            */
/**********************************************************************/
so3.init('generic', 0, {
    sensorValue: 87,
    5703: 87
});


var nc,
    coapNode1 = new CoapNode('nodeTest1', so1),
    coapNode2 = new CoapNode('nodeTest2', so2, {
        manuf: 'freebird'
    }),
    coapNode3 = new CoapNode('nodeTest3', so3, {
        model: 'coap-7688'
    }),
    permAddr1, 
    permAddr2, 
    permAddr3,
    mac;

/**********************************************************************/
/* mock object                                                        */
/**********************************************************************/
var rawDev = {
        "clientName":"testDev",
        "clientId": 1,
        "lifetime":86400,
        "version":"1.0.0",
        "ip":"127.0.0.1",
        "mac":"AA:BB:CC:DD:EE:FF",
        "port":34490,
        "joinTime":1462345440414,
        "objList":{
            "1":["0"],"3":["0"],"4":["0"],"3303":["0","1"]
        },
        "so":{
            "lwm2mServer":{
                "0":{
                    "lifetime":86400,
                    "defaultMinPeriod":0,
                    "defaultMaxPeriod":60
                }
            },
            "device":{
                "0":{
                    "manuf":"sivann",
                    "model":"cnode-01",
                    "devType":"generic",
                    "hwVer":"v1.0",
                    "swVer":"v1.0",
                    "firmware":"v1.0"
                }
            },
            "connMonitor":{
                "0":{
                    "ip":"192.168.1.117",
                    "routeIp":"192.168.1.1"
                }
            },
            "temperature":{
                "0":{
                    "5702":"Thu May 12 2016 11:25:38 GMT+0800 (CST)",
                    "5703":"_unreadable_",
                    "5704":"_exec_",
                    "sensorValue":21,
                    "units":"C"
                },
                "1":{
                    "sensorValue":70,
                    "units":"F"
                }
            }
        },
    },
    rawGad = {
        oid: 'temperature',
        iid: '1',
        resrcs: {
            sensorValue: 70,
            units: 'F'
        }
    };

var dev,
    gad;

/**********************************************************************/
/* test                                                               */
/**********************************************************************/
describe('Cook Functional Check', function() {
    before(function () {
        nc = require('../index')();
        dev = new Device(nc, rawDev);
        gad = new Gadget(dev, 'temperature/1', rawGad);
    });

    it('cookRawDev()', function (done) {
        nc.cookRawDev(dev, rawDev, function (err, cooked) {
            var netInfo = {
                    address: {
                        permanent: 'AA:BB:CC:DD:EE:FF/testDev', 
                        dynamic: '127.0.0.1'
                    }
                },
                attrInfo = {
                    manufacturer: 'sivann',
                    model: 'cnode-01',
                    serial: '',
                    version: {
                        hw: 'v1.0', 
                        sw: 'v1.0', 
                        fw: 'v1.0'},
                    power: { 
                        type: '', 
                        voltage: ''
                    }
                };

            if (err) {
                console.log(err);
            } else {
                if (_.isEqual(cooked._net.address, netInfo.address) && _.isEqual(cooked._attrs, attrInfo))
                    done();
            }
        });
    });

    it('cookRawGad()', function (done) {
        nc.cookRawGad(gad, rawGad, function (err, cooked) {
            var panelInfo = {
                    enabled: false, 
                    profile: null,
                    classId: 'temperature'
                },
                attrInfo = {
                    sensorValue: 70,
                    units: 'F'
                };

            if (err) {
                console.log(err);
            } else {
                if (_.isEqual(cooked._panel, panelInfo) && _.isEqual(cooked._attrs , attrInfo))
                    done();
            }
        });
    });
});

describe('Netcore Drivers Check', function () {
    this.timeout(5000);

    it('start()', function (done) {
        nc.start(function (err) {
            if (err) 
                console.log(err);
            else 
                done();
        });
    });

    it('stop()', function (done) {
        nc.stop(function (err) {
            if (err) 
                console.log(err);
            else 
                done();
        });
    });

    it('start() - again', function (done) {
        nc.start(function (err) {
            if (err)
                console.log(err);
            else 
                done();
        });
    });

    it('reset()', function (done) {
        nc.reset(function (err) {
            if (err)
                console.log(err);
            else 
                done();
        });
    });

    it('permitJoin()', function (done) {
        nc.permitJoin(180, function (err) {
            if (err) 
                console.log(err);
            else 
                done();
        });
    }); 

    it('Device1 register', function (done) {
        var clientName,
            devRegHdlr = function (msg) {
                switch(msg.type) {
                    case 'devIncoming':
                        clientName = msg.cnode.clientName;
                        mac = msg.cnode.mac;
                        permAddr1 = mac + '/' + clientName;

                        if (clientName === 'nodeTest1') {
                            nc._controller.removeListener('ind', devRegHdlr);
                            done();
                        }
                        break;
                    default:
                        break;
                }
            };

        nc._controller.on('ind', devRegHdlr);

        coapNode1.register('127.0.0.1', 5683, function (err, rsp) {
            if(err) console.log(err);
        });
    });

    it('remove()', function (done) {
        nc.remove(permAddr1, function (err) {
            if (err) console.log(err);
            else done();
        });
    });

    it('Device1 re-register', function (done) {
        var clientName,
            devReRegHdlr = function (msg) {
                switch(msg.type) {
                    case 'devIncoming':
                        clientName = msg.cnode.clientName;
                        permAddr1 = msg.cnode.mac + '/' + clientName;

                        if (clientName === 'nodeTest1') {
                            nc._controller.removeListener('ind', devReRegHdlr);
                            done();
                        }
                        break;
                    default:
                        break;
                }
            };

        nc._controller.on('ind', devReRegHdlr);

        coapNode1.register('127.0.0.1', 5683, function (err, rsp) {
            if(err) console.log(err);
        });
    });

    it('ping()',function (done) {
        nc.ping(permAddr1, function (err, result) {
            if (err) {
                console.log(err);
            } else if (Number(result)) {
                done(); 
            }
        });    
    });

    it('Device2 register',function (done) {
        var clientName,
            devSecRegHdlr = function (msg) {
                switch(msg.type) {
                    case 'devIncoming':
                        clientName = msg.cnode.clientName;
                        permAddr2 = msg.cnode.mac + '/' + clientName;

                        if (clientName === 'nodeTest2') {
                            nc._controller.removeListener('ind', devSecRegHdlr);
                            done();
                        }
                        break;
                    default:
                        break;
                }
            };

        nc._controller.on('ind', devSecRegHdlr);

        coapNode2.register('127.0.0.1', 5683, function (err, rsp) {
            if(err) console.log(err);
        });     
    });

    it('Device3 register',function (done) {
        var clientName,
            devThiRegHdlr = function (msg) {
                switch(msg.type) {
                    case 'devIncoming':
                        clientName = msg.cnode.clientName;
                        permAddr3 = msg.cnode.mac + '/' + clientName;

                        if (clientName === 'nodeTest3') {
                            nc._controller.removeListener('ind', devThiRegHdlr);
                            done();
                        }
                        break;
                    default:
                        break;
                }
            };

        nc._controller.on('ind', devThiRegHdlr);

        coapNode3.register('127.0.0.1', 5683, function (err, rsp) {
            if(err) console.log(err);
        });     
    });

    it('ban()', function (done) {
        //not implement
        done();
    });

    it('unban()', function (done) {
        //not implement
        done();
    });
});

describe('Device Drivers Check', function () {
    this.timeout(10000);

    it('read()', function (done) {

        nc._findDriver('dev', 'read')(permAddr1, 'manufacturer', function (err, result) {
            if (err) {
                console.log(err);
            } else if (result === 'sivann')
                done();
        });
    });

    it('read() - attr not exist', function (done) {
        nc._findDriver('dev', 'read')(permAddr1, 'foo', function (err, result) {
            if (err) done();
        });
    });

    it('read() - device2', function (done) {
        nc._findDriver('dev', 'read')(permAddr2, 'manufacturer', function (err, result) {
            if (err) {
                console.log(err);
            } else if (result === 'freebird')
                done();
        });
    });

    it('read() - device3', function (done) {
        nc._findDriver('dev', 'read')(permAddr3, 'model', function (err, result) {
            if (err) {
                console.log(err);
            } else if (result === 'coap-7688')
                done();
        });
    });

    it('write() - device1 do not has attr is writable', function (done) {
        // nc._findDriver('dev', 'write')(permAddr1, 'serial', 'c-0001', function (err, result) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         nc._findDriver('dev', 'read')(permAddr1, 'serial', function (err, result) {
        //             if (err) {
        //                 console.log(err);
        //             } else if (result === 'c-0001')
        //                 done();
        //         });
        //     }
        // });
        done();
    });

    it('write() - attr not exist', function (done) {
        nc._findDriver('dev', 'write')(permAddr1, 'foo', 'c-0001', function (err, result) {
            if (err) done();
        });
    });

    it('write() - device2 do not has attr is writable', function (done) {
        // nc._findDriver('dev', 'write')(permAddr2, 'serial', 'c-0002', function (err, result) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         nc._findDriver('dev', 'read')(permAddr2, 'serial', function (err, result) {
        //             if (err) {
        //                 console.log(err);
        //             } else if (result === 'c-0002')
        //                 done();
        //         });
        //     }
        // });
        done();
    });

    it('write() - device3 do not has attr is writable', function (done) {
        // nc._findDriver('dev', 'write')(permAddr3, 'serial', 'c-0003', function (err, result) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         nc._findDriver('dev', 'read')(permAddr3, 'serial', function (err, result) {
        //             if (err) {
        //                 console.log(err);
        //             } else if (result === 'c-0003')
        //                 done();
        //         });
        //     }
        // });
        done();
    });
});

describe('Gadget Drivers Check', function () {
    this.timeout(10000);

    it('read()', function (done) {
        nc._findDriver('gad', 'read')(permAddr1, 'temperature/0', 'sensorValue', function (err, result) {
            if (err) {
                console.log(err);
            } else if (result === 21) {
                done();
            }
        });
    });

    it('read() - not found', function (done) {
        nc._findDriver('gad', 'read')(permAddr1, 'temperature/0', 'foo', function (err, result) {
            if (err) done();
        });
    });

    it('read() - not allowed', function (done) {
        nc._findDriver('gad', 'read')(permAddr1, 'temperature/0', '5703', function (err, result) {
            if (err) done();
        });
    });

    it('read() - device2', function (done) {
        nc._findDriver('gad', 'read')(permAddr2, 'humidity/0', 'sensorValue', function (err, result) {
            if (err) {
                console.log(err);
            } else if (result === 56) {
                done();
            }
        });
    });

    it('read() - device3', function (done) {
        nc._findDriver('gad', 'read')(permAddr3, 'generic/0', 'sensorValue', function (err, result) {
            if (err) {
                console.log(err);
            } else if (result === 87) {
                done();
            }
        });
    });

    it('write()', function (done) {
        nc._findDriver('gad', 'write')(permAddr1, 'temperature/1', '5703', 25, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                nc._findDriver('gad', 'read')(permAddr1, 'temperature/1', '5703', function (err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result === 25) {
                        done();
                    }
                });
            }
        });
    });

    it('write() - device2', function (done) {
        nc._findDriver('gad', 'write')(permAddr2, 'humidity/0', '5703', 55, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                nc._findDriver('gad', 'read')(permAddr2, 'humidity/0', '5703', function (err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result === 55) {
                        done();
                    }
                });
            }
        });
    });

    it('write() - device3', function (done) {
        nc._findDriver('gad', 'write')(permAddr3, 'generic/0', '5703', 88, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                nc._findDriver('gad', 'read')(permAddr3, 'generic/0', '5703', function (err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result === 88) {
                        done();
                    }
                });
            }
        });
    });

    it('write() - not found', function (done) {
        nc._findDriver('gad', 'write')(permAddr1, 'temperature/0', 'foo', 25, function (err, result) {
            if (err) done();
        });
    });

    it('write() - not allowed', function (done) {
        nc._findDriver('gad', 'write')(permAddr1, 'temperature/0', '5702', 25, function (err, result) {
            if (err) done();
        });
    });

    it('exec()', function (done) {
        nc._findDriver('gad', 'exec')(permAddr1, 'temperature/0', '5704', ['Peter', 'KSHMR'], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                done();
            }
        });
    });

    it('exec() - not found', function (done) {
        nc._findDriver('gad', 'exec')(permAddr1, 'temperature/0', 'foo', [], function (err, result) {
            if (err) done();
        });
    });

    it('exec() - not allowed', function (done) {
        nc._findDriver('gad', 'exec')(permAddr1, 'temperature/0', 'sensorValue', [], function (err, result) {
            if (err) done();
        });
    });

    var cfg;

    it('writeReportCfg()', function (done) {
        cfg = {
            pmin: 0,
            pmax: 60,
            gt: 5
        };

        nc._findDriver('gad', 'writeReportCfg')(permAddr1, 'temperature/1', '5703', cfg, function (err, result) {
            if (result === true) done();
        });
    });

    it('writeReportCfg() - enable true', function (done) {
        var devReportHdlr = function (msg) {
                switch(msg.type) {
                    case 'devNotify':
                            if (msg.data.value === 40) {
                                nc._controller.removeListener('ind', devReportHdlr);
                                done(); 
                            }
                        break;
                    default:
                        break;
                }
            };

        cfg = {
            enable: true
        };

        nc._findDriver('gad', 'writeReportCfg')(permAddr1, 'temperature/1', '5703', cfg, function (err, result) {
            if (result === true) {
                nc._controller.on('ind', devReportHdlr);
                nc._findDriver('gad', 'write')(permAddr1, 'temperature/1', '5703', 40, function (err, result) {
                    if (err) console.log(err);
                });
            }  
        });
    });


    it('writeReportCfg() - enable true - device2', function (done) {
        var devReportHdlr = function (msg) {
                switch(msg.type) {
                    case 'devNotify':
                            if (msg.data.value === 50) {
                                nc._controller.removeListener('ind', devReportHdlr);
                                done(); 
                            }
                        break;
                    default:
                        break;
                }
            };

        cfg = {
            enable: true
        };

        nc._findDriver('gad', 'writeReportCfg')(permAddr2, 'humidity/0', '5703', cfg, function (err, result) {
            if (result === true) {
                nc._controller.on('ind', devReportHdlr);
                nc._findDriver('gad', 'write')(permAddr2, 'humidity/0', '5703', 50, function (err, result) {
                    if (err) console.log(err);
                });
            }  
        });
    });


    it('writeReportCfg() - enable true - device3', function (done) {
        var devReportHdlr = function (msg) {
                switch(msg.type) {
                    case 'devNotify':
                            if (msg.data.value === 80) {
                                nc._controller.removeListener('ind', devReportHdlr);
                                done(); 
                            }
                        break;
                    default:
                        break;
                }
            };

        cfg = {
            enable: true
        };

        nc._findDriver('gad', 'writeReportCfg')(permAddr3, 'generic/0', '5703', cfg, function (err, result) {
            if (result === true) {
                nc._controller.on('ind', devReportHdlr);
                nc._findDriver('gad', 'write')(permAddr3, 'generic/0', '5703', 80, function (err, result) {
                    if (err) console.log(err);
                });
            }  
        });
    });

    it('writeReportCfg() - enable false', function (done) {
        cfg = {
            enable: false
        };

        nc._findDriver('gad', 'writeReportCfg')(permAddr1, 'temperature/1', '5703', cfg, function (err, result) {
            if (result === true) done();
        });
    });

    it('writeReportCfg() - attr not allowed', function (done) {
        cfg = {
            foo: false
        };

        nc._findDriver('gad', 'writeReportCfg')(permAddr1, 'temperature/0', '5703', cfg, function (err, result) {
            if (err) done();
        });
    });

    it('writeReportCfg() - not found', function (done) {
        cfg = {
            pmin: 0,
            pmax: 60
        };

        nc._findDriver('gad', 'writeReportCfg')(permAddr1, 'temperature/0', 'foo', cfg, function (err, result) {
            if (err) done();
        });
    });

    it('readReportCfg()', function (done) {
        cfg = {
            pmin: 0,
            pmax: 60,
        };

        nc._findDriver('gad', 'readReportCfg')(permAddr1, 'temperature/1', 'sensorValue', function (err, result) {
            if (_.isEqual(result, cfg)) done();
        });
    });

    it('readReportCfg() - not found', function (done) {
        nc._findDriver('gad', 'readReportCfg')(permAddr1, 'temperature/1', 'foo', function (err, result) {
            if (err) done();
        });
    });

    it('readReportCfg() - device2', function (done) {
        cfg = {
            pmin: 0,
            pmax: 60,
        };

        nc._findDriver('gad', 'readReportCfg')(permAddr2, 'humidity/0', 'sensorValue', function (err, result) {
            if (_.isEqual(result, cfg)) done();
        });
    });

    it('readReportCfg() - device3', function (done) {
        cfg = {
            pmin: 0,
            pmax: 60,
        };

        nc._findDriver('gad', 'readReportCfg')(permAddr3, 'generic/0', 'sensorValue', function (err, result) {
            if (_.isEqual(result, cfg)) done();
        });
    });
});
