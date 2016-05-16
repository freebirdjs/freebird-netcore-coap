var should = require('should'),
    _ = require('lodash'),
    nc = require('../netcore'),
    Netcore = require('freebird-base').Netcore,
    Device = require('freebird-base').Device,
    Gadget = require('freebird-base').Gadget;

var rawDev = {
        "clientName":"nodeTest",
        "lifetime":86400,
        "version":"1.0.0",
        "ip":"127.0.0.1",
        "mac":"00:0c:29:3c:fc:7d",
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

var dev = new Device(nc, rawDev),
    gad = new Gadget(dev, 'temperature/1', rawGad);

describe('Cook Functional Check', function() {
    it('cookRawDev()', function (done) {
        nc.cookRawDev(dev, rawDev, function (err, cooked) {
            var netInfo = {
                    address: {
                        permanent: '00:0c:29:3c:fc:7d', 
                        dynamic: '127.0.0.1'
                    }
                },
                attrInfo = {
                    manufacturer: 'sivann',
                    model: 'cnode-01',
                    version: {
                        hw: 'v1.0', 
                        sw: 'v1.0', 
                        fw: 'v1.0'}
                };

            if (err) {
                console.log(err);
            } else {
                if (_.isMatch(cooked._net, netInfo) && _.isMatch(cooked._attrs, attrInfo))
                    done();
            }
        });
    });

    it('cookRawGad()', function (done) {
        nc.cookRawGad(gad, rawGad, function (err, cooked) {
            var panelInfo = {
                    class: 'temperature'
                },
                attrInfo = {
                    sensorValue: 70,
                    units: 'F'
                };

            if (err) {
                console.log(err);
            } else {
                if (_.isMatch(cooked._panel, panelInfo) && _.isMatch(cooked._attrs , attrInfo))
                    done();
            }
        });
    });
});

describe('Netcore Drivers Check', function () {
    this.timeout(3000);

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

    this.timeout(10000);
    it('remove()', function (done) {
        var clientName,
            devRemoveHdlr = function (msg) {
                switch(msg.type) {
                    case 'registered':
                        clientName = msg.data.clientName;
                        nc.remove(msg.data.mac, function (err) {
                            if (err) console.log(err);
                        });
                        break;
                    case 'deregistered':
                        if (msg.data === clientName) {
                            nc._controller.removeListener('ind', devRemoveHdlr);
                            done();
                        }
                        break;
                    default:
                        break;
                }
            };

        nc._controller.on('ind', devRemoveHdlr);
    });

    it('ping()',function (done) {
        var devPingHdlr = function (msg) {
                switch(msg.type) {
                    case 'registered':
                        setTimeout(function () {
                            nc.ping(msg.data.mac, function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else if (Number(result)) {
                                    nc._controller.removeListener('ind', devPingHdlr);
                                    done(); 
                                }
                            });
                        }, 1000);
                        break;
                    default:
                        break;
                }
            };

        nc._controller.on('ind', devPingHdlr);
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
    var permAddr = '00:0c:29:3c:fc:7d';

    this.timeout(10000);
    it('read()', function (done) {
        nc.devRead(permAddr, 'manufacturer', function (err, result) {
            if (err) {
                console.log(err);
            } else if (result === 'sivann')
                done();
        });
    });

    it('read() - attr not exist', function (done) {
        nc.devRead(permAddr, 'foo', function (err, result) {
            if (err) done();
        });
    });

    it('write()', function (done) {
        nc.devWrite(permAddr, 'serial', 'c-0001', function (err, result) {
            if (err) {
                console.log(err);
            } else {
                done();
            }
        });
    });

    it('write() - bad request', function (done) {
        nc.devWrite(permAddr, 'serial', 1000, function (err, result) {
            if (err) done();
        });
    });

    it('write() - attr not exist', function (done) {
        nc.devWrite(permAddr, 'foo', 'c-0001', function (err, result) {
            if (err) done();
        });
    });

    it('identify', function (done) {
        //not implement
        done();
    });
});

describe('Gadget Drivers Check', function () {
    var permAddr = '00:0c:29:3c:fc:7d';

    this.timeout(10000);
    it('read()', function (done) {
        nc.gadRead(permAddr, 'temperature/0', 'sensorValue', function (err, result) {
            if (err) {
                console.log(err);
            } else if (result === 21) {
                done();
            }
        });
    });

    it('read() - not found', function (done) {
        nc.gadRead(permAddr, 'temperature/0', 'foo', function (err, result) {
            if (err) done();
        });
    });

    it('read() - not allowed', function (done) {
        nc.gadRead(permAddr, 'temperature/0', '5703', function (err, result) {
            if (err) done();
        });
    });

    it('write()', function (done) {
        nc.gadWrite(permAddr, 'temperature/0', 'sensorValue', 25, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                nc.gadRead(permAddr, 'temperature/0', 'sensorValue', function (err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result === 25) {
                        done();
                    }
                });
            }
        });
    });

    it('write() - bad request', function (done) {
        nc.gadWrite(permAddr, 'temperature/0', 'sensorValue', 'bad', function (err, result) {
            if (err) done();
        });
    });

    it('write() - not found', function (done) {
        nc.gadWrite(permAddr, 'temperature/0', 'foo', 25, function (err, result) {
            if (err) done();
        });
    });

    it('write() - not allowed', function (done) {
        nc.gadWrite(permAddr, 'temperature/0', '5702', 25, function (err, result) {
            if (err) done();
        });
    });

    it('exec()', function (done) {
        nc.gadExec(permAddr, 'temperature/0', '5704', ['Peter', 'KSHMR'], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                done();
            }
        });
    });

    it('exec() - not found', function (done) {
        nc.gadExec(permAddr, 'temperature/0', 'foo', [], function (err, result) {
            if (err) done();
        });
    });

    it('exec() - not allowed', function (done) {
        nc.gadExec(permAddr, 'temperature/0', 'sensorValue', [], function (err, result) {
            if (err) done();
        });
    });

    var cfg;

    it('setReportCfg()', function (done) {
        cfg = {
            pmin: 0,
            pmax: 60,
            gt: 5
        };

        nc.setReportCfg(permAddr, 'temperature/0', 'sensorValue', cfg, function (err, result) {
            if (result === true) done();
        });
    });

    it('setReportCfg() - enable true', function (done) {
        var devReportHdlr = function (msg) {
                switch(msg.type) {
                    case 'notify':
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

        nc.setReportCfg(permAddr, 'temperature/0', 'sensorValue', cfg, function (err, result) {
            if (result === true) {
                nc._controller.on('ind', devReportHdlr);
                nc.gadWrite(permAddr, 'temperature/0', 'sensorValue', 40, function (err, result) {
                    if (err) console.log(err);
                });
            }  
        });

    });

    it('setReportCfg() - enable false', function (done) {
        cfg = {
            enable: false
        };

        nc.setReportCfg(permAddr, 'temperature/0', 'sensorValue', cfg, function (err, result) {
            if (result === true) done();
        });
    });

    it('setReportCfg() - attr not allowed', function (done) {
        cfg = {
            foo: false
        };

        nc.setReportCfg(permAddr, 'temperature/0', 'sensorValue', cfg, function (err, result) {
            if (err) done();
        });
    });

    it('setReportCfg() - not found', function (done) {
        cfg = {
            pmin: 0,
            pmax: 60
        };

        nc.setReportCfg(permAddr, 'temperature/0', 'foo', cfg, function (err, result) {
            if (err) done();
        });
    });

    it('getReportCfg()', function (done) {
        cfg = {
            pmin: 0,
            pmax: 60,
        };

        nc.getReportCfg(permAddr, 'temperature/1', 'sensorValue', function (err, result) {
            if (_.isEqual(result, cfg)) done();
        });
    });

    it('getReportCfg() - not found', function (done) {
        nc.getReportCfg(permAddr, 'temperature/1', 'foo', function (err, result) {
            if (err) done();
        });
    });
});
