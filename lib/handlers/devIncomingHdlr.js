var _ = require('busyman');

var CNST = require('../constants'),
    helper = require('../helper');

module.exports = function (nc, dev) {
    var permAddr = helper.buildPermAddr(dev.mac, dev.clientName),
        auxId,
        gad,
        oid;

    dev.observeReq('device/0');

    nc.commitDevIncoming(permAddr, dev);

    _.forEach(dev.so, function (iObj, okey) {
        if (CNST.ipsoDefs.indexOf(okey) >= 0) {
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
};
