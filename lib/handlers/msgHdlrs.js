var msgHdlrs = {
    devIncoming: require('./devIncomingHdlr'),
    devLeaving: require('./devLeavingHdlr'),
    devUpdate: require('./devUpdateHdlr'),
    devStatus: require('./devStatusHdlr'),
    devNotify: require('./devNotifyHdlr')
};

module.exports = msgHdlrs;
