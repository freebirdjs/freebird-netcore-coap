var _ = require('busyman'),
    shepherd = require('coap-shepherd'),
    fbBase = require('freebird-base'),
    Netcore = fbBase.Netcore;

var cookRawDev = require('./components/cookRawDev'),
    cookRawGad = require('./components/cookRawGad'),
    msgHdlrs = require('./handlers/msgHdlrs'),
    drivers = require('./drivers/drivers')(shepherd),
    helper = require('./helper');

var nc;

var coapNc = function (name) {
    var ncName = name || 'freebird-netcore-coap';

    shepherd.on('error', shepherdErrorHdlr);
    shepherd.on('ready', shepherdReadyHdlr);
    shepherd.on('ind', shepherdIndHdlr);

    nc = new Netcore(ncName, shepherd, { phy: 'ieee802.15.4', nwk: 'ip', apl: 'coap' });

    nc.cookRawDev = cookRawDev;
    nc.cookRawGad = cookRawGad;

    nc.registerNetDrivers(drivers.net);
    nc.registerDevDrivers(drivers.dev);
    nc.registerGadDrivers(drivers.gad);

    return nc;
};

/*************************************************************************************************/
/*** Shepherd Event Handlers                                                                   ***/
/*************************************************************************************************/
function shepherdErrorHdlr (err) {
    if (_.isFunction(netcore.commitError))
        netcore.commitError('net', err);
}

function shepherdReadyHdlr () {
    nc.commitReady();
}

function shepherdIndHdlr (msg) {
    var data = msg.data,
        dev;

    switch(msg.type) {
        case 'registered': 
            dev = data; 
            msgHdlrs.registered(nc, dev);
            break;

        case 'deregistered':
            break;

        case 'online':
            dev = shepherd.find(data);
            msgHdlrs.online(nc, dev);
            break;

        case 'offline':
            dev = shepherd.find(data);
            msgHdlrs.offline(nc, dev);
            break;

        case 'update':
            break;

        case 'notify':
            dev = shepherd.find(data.device);
            msgHdlrs.notify(nc, dev, data);
            break;
        default:
            break;
    }
}

module.exports = coapNc;
