var _ = require('busyman'),
    shepherd = require('coap-shepherd'),
    fbBase = require('freebird-base');

var cookRawDev = require('./components/cookRawDev'),
    cookRawGad = require('./components/cookRawGad'),
    msgHdlrs = require('./handlers/msgHdlrs'),
    drivers = require('./drivers/drivers')(shepherd),
    helper = require('./helper');

var coapNc = function (name) {
    var ncName = name || 'freebird-netcore-coap',
        nc = fbBase.createNetcore(ncName, shepherd, { phy: 'ieee802.15.4', nwk: 'ip', apl: 'coap' });

    nc.cookRawDev = cookRawDev;
    nc.cookRawGad = cookRawGad;

    nc.registerNetDrivers(drivers.net);
    nc.registerDevDrivers(drivers.dev);
    nc.registerGadDrivers(drivers.gad);

    shepherd.on('ready', shepherdReadyHdlr(nc));
    shepherd.on('ind', shepherdIndHdlr(nc));

    return nc;
};

/*************************************************************************************************/
/*** Shepherd Event Handlers                                                                   ***/
/*************************************************************************************************/
function shepherdReadyHdlr (nc) {
    return function () {
        nc.commitReady();
    };
}

function shepherdIndHdlr (nc) {
    return function (msg) {
        var data = msg.data,
            dev = msg.cnode;

        switch(msg.type) {
            case 'devIncoming': 
                msgHdlrs.devIncoming(nc, dev);
                break;

            case 'devLeaving':  // dev is a name not instance
                break;

            case 'devUpdate':
                break;

            case 'devStatus':
                msgHdlrs.devStatus(nc, dev);
                break;

            case 'devNotify':
                msgHdlrs.devNotify(nc, dev, data);
                break;

            default:
                break;
        }
    };
}

module.exports = coapNc;
