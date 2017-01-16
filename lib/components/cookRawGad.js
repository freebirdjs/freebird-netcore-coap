var CNST = require('../constants');

module.exports = function (gad, rawGad, callback) {
    var cls;

    if (CNST.ipsoDefs.indexOf(rawGad.oid) >= 0) {
        cls = rawGad.oid;
    } else {
        cls = 'generic';
    }

    gad.set('panel', {
        profile: null,
        classId: cls
    });

    gad.set('attrs', rawGad.resrcs);

    callback(null, gad);
};