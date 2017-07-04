var fs = require('fs'),
    path = require('path'),
    _ = require('busyman'),
    should = require('should'),
    expect = require('chai').expect;

var Freebird = require('freebird'),
    CoapNode = require('coap-node'),
    SmartObject = require('smartobject'),
    FBCONST = require('freebird-constants');

var nc = require('../index')();

try {
    fs.unlinkSync(path.resolve('./node_modules/coap-shepherd/lib/database/coap.db'));
    fs.unlinkSync(path.resolve('./node_modules/freebird/database/devices.db'));
    fs.unlinkSync(path.resolve('./node_modules/freebird/database/gadgets.db'));
} catch (e) {
    console.log(e);
}

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
    },
    5705: 21
});

/**********************************************************************/
/* coapNode2 init resource                                            */
/**********************************************************************/
so2.init('humidity', 0, {
    sensorValue: 56,
    units: '%',
});

/**********************************************************************/
/* coapNode3 init resource                                            */
/**********************************************************************/
so3.init('generic', 0, {
    sensorValue: 87,
});

var coapNode1 = new CoapNode('nodeTest1', so1, { manuf: 'freebird' }),
    coapNode2 = new CoapNode('nodeTest2', so2),
    fbird = new Freebird([nc]),
    permAddr1;

describe('Intergration test', function () {
    this.timeout(5000);


    describe('#Netcore', function () {
        describe('#.start()', function (done) {
            it('should start the controller and set enable true', function (done) {
                fbird.start(function (err) {
                    expect(nc._controller._enabled).to.be.equal(true);
                    done();
                });
            });
        });

        describe('#.permitJoin()', function () {
            // devIncoming, gadIncoming, devNetChanging
            it('should permitJoin and node 1 incoming', function (done) {
                function devIncomingLsn (msg) {
                    fbird.removeListener('devIncoming', devIncomingLsn);
                    permAddr1 = coapNode1.mac + '/' + coapNode1.clientName;
                    expect(msg.ncName).to.be.equal('freebird-netcore-coap');
                    expect(msg.permAddr).to.be.equal(permAddr1);
                }

                function gadIncomingLsn (msg) {
                    fbird.removeListener('gadIncoming', gadIncomingLsn);
                    expect(msg.ncName).to.be.equal('freebird-netcore-coap');
                    expect(msg.permAddr).to.be.equal(permAddr1);
                    expect(msg.auxId).to.be.equal('temperature/0');
                    done();
                }

                fbird.on('devIncoming', devIncomingLsn);
                fbird.on('gadIncoming', gadIncomingLsn);

                fbird.permitJoin(180, function (err) {
                    expect(nc._controller._joinable).to.be.equal(true);
                    coapNode1.register('localhost', 5683);
                });
            });
        });    

        describe('#.ban()', function () {
            it('should ban node 2', function (done) {
                function bannedDevIncomingLsn (msg) {
                    fbird.removeListener('bannedDevIncoming', bannedDevIncomingLsn);
                    expect(msg.permAddr).to.be.equal(coapNode1.mac + '/' + coapNode2.clientName);
                    done();
                }

                fbird.on('bannedDevIncoming', bannedDevIncomingLsn);

                fbird.ban(nc.getName(), coapNode1.mac + '/' + coapNode2.clientName, function (err) {
                    coapNode2.register('localhost', 5683);
                });
            });
        });    

        describe('#.unban()', function () {   
            it('should unban node 2', function (done) {
                function devIncomingLsn (msg) {
                    fbird.removeListener('devIncoming', devIncomingLsn);
                    expect(msg.ncName).to.be.equal('freebird-netcore-coap');
                    expect(msg.permAddr).to.be.equal(coapNode1.mac + '/' + coapNode2.clientName);
                    done();
                }

                fbird.on('devIncoming', devIncomingLsn);

                fbird.unban(nc.getName(), coapNode1.mac + '/' + coapNode2.clientName, function (err) {
                    coapNode2.register('localhost', 5683);
                });
            });
        });    

        describe('#.ping()', function () {
            it('should ping node 1', function () {
                fbird.ping(nc.getName(), permAddr1, function (err, time) {
                    if (time)
                        done();
                });
            });
        });    

        describe('#.maintain()', function () {
            it('should maintain nc', function () {
                fbird.maintain(nc.getName(), function (err) {
                    // [TODO]
                });
            });
        });    

        describe('#.remove()', function () {
            // devLeaving
            it('remove node 2', function (done) {
                function devLeavingLsn (msg) {
                    fbird.removeListener('devLeaving', devLeavingLsn);
                    expect(msg.ncName).to.be.equal('freebird-netcore-coap');
                    expect(msg.permAddr).to.be.equal(coapNode1.mac + '/' + coapNode2.clientName);
                    done();
                }

                fbird.on('devLeaving', devLeavingLsn);

                fbird.remove(nc.getName(), coapNode1.mac + '/' + coapNode2.clientName, function (err) {
                    if (err)
                        console.log(err);
                });
            });
        });   
    });

    describe('#Device', function () {
        describe('#.read()', function () {
            it('should read device manufacturer', function (done) {
                var dev = fbird.findByNet('device', nc.getName(), permAddr1);

                dev.read('manufacturer', function (err, data) {
                    expect(data).to.be.equal('freebird');
                    done();
                });
            });
        });

        describe('#.write()', function () {
            // devReporting
            it('not attributes can write', function (done) {
                done();
            });
        });

        describe('#.identify()', function () {  
            it('not implement yet', function (done) {
                // [TODO]
                done();
            });
        });
    });  

    describe('#Gadget', function () {
        describe('#.read', function () {
            it('should read gadget temperature/0 sensorValue', function (done) {
                var gad = fbird.findByNet('gadget', nc.getName(), permAddr1, 'temperature/0');

                gad.read('sensorValue', function (err, data) {
                    expect(data).to.be.equal(21);
                    done();
                });
            });
        });

        describe('#.write', function () {
            it('should write gadget temperature/0 5705', function (done) {
                var gad = fbird.findByNet('gadget', nc.getName(), permAddr1, 'temperature/0');

                gad.write('5705', 19, function (err, data) {
                    gad.read('5705', function (err, data) {
                        expect(data).to.be.equal(13);  // [TODO] lwm2m-coder not IPSO id
                        done();
                    });
                });
            });
        });

        describe('#.exec', function () {
            it('should exec gadget temperature/0 5704', function (done) {
                var gad = fbird.findByNet('gadget', nc.getName(), permAddr1, 'temperature/0');

                gad.exec('5704', ['A', 'B'], function (err) {
                    done();
                });
            });
        });

        describe('#.readReportCfg()', function () {
            it('should read gadget temperature/0 5705 reportCfg', function (done) {
                var gad = fbird.findByNet('gadget', nc.getName(), permAddr1, 'temperature/0'),        
                    cfg = {
                        pmin: 0,
                        pmax: 60,
                    };

                gad.readReportCfg('5705', function (err, data) {
                    if (_.isEqual(data, cfg))
                        done();
                });
            });
        });

        describe('#.writeReportCfg()', function () {
            // gadReporting
            it('should write gadget temperature/0 5705 reportCfg', function (done) {
                var gad = fbird.findByNet('gadget', nc.getName(), permAddr1, 'temperature/0'),
                    cfg = {
                        pmin: 0,
                        pmax: 100,
                        gt: 0.5
                    };

                gad.writeReportCfg('5705', cfg, function (err, data) {
                    if (data) {
                        gad.readReportCfg('5705', function (err, data) {
                            if (_.isEqual(data, cfg))
                                done();
                        });
                    }
                });
            });
        });
    });


    describe('#Netcore', function () {
        describe('#.reset()', function () {
            it('should reset the controller', function (done) {
                fbird.reset(0, function (err) {
                    expect(nc._controller._enabled).to.be.equal(true);
                    done();
                });
            });
        });    

        describe('#.stop()', function () {
            it('should start the controller and set enable false', function (done) {
                fbird.stop(function (err) {
                    expect(nc._controller._enabled).to.be.equal(false);
                    done();
                });
            });
        });    
    });
});
