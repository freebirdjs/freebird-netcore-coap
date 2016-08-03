var msgHdlrs = {
    registered: require('./registeredHdlr'),
    deregistered: require('./deregisteredHdlr'),
    update: require('./updateHdlr'),
    online: require('./onlineHdlr'),
    offline: require('./offlineHdlr'),
    notify: require('./notifyHdlr')
};

module.exports = msgHdlrs;
