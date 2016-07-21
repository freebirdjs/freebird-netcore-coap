freebird-netcore-coap  
========================
[![NPM](https://nodei.co/npm/freebird-netcore-coap.png?downloads=true)](https://nodei.co/npm/freebird-netcore-coap/)  

[![Build Status](https://travis-ci.org/freebirdjs/freebird-netcore-coap.svg?branch=master)](https://travis-ci.org/freebirdjs/freebird-netcore-coap)
[![npm](https://img.shields.io/npm/v/freebird-netcore-coap.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-netcore-coap)
[![npm](https://img.shields.io/npm/l/freebird-netcore-coap.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-netcore-coap)

## Table of Contents 

1. [Overview](#Overview)  
2. [Installation](#Installation)  
3. [Basic Usage](#Usage)  
4. [APIs](#APIs)   

<a name="Overview"></a>
## 1. Overview 

**freebird-netcore-coap** 

<a name="Installation"></a>
## 2. Installation 

> $ npm install freebird-netcore-coap --save

<a name="Usage"></a>
## 3. Basic Usage 

```js
var Freebird = require('freebird'),
    coapCore = require('freeebird-netcore-coap')(),
    http = require('http');

var httpServer = http.createServer();
httpServer.listen(3000);

var freebird = new Freebird(httpServer);

freebird.registerNetcore(coapCore, function (err) {
    if (err)
        console.log('err');
});

// after registered this netcore, start the freebird server
freebird.start(function (err) {
    var coapCoreName = coapCore.getName();      // 'coapcore'
    freebird.net.permitJoin(coapCoreName, 300); // Let your coap peripheral machines join the network
});
```

<a name="APIs"></a>
## 4. APIs 

* [start()](#API_start)
* [stop()](#API_stop)
* [reset()](#API_reset)
* [permitJoin()](#API_permitJoin)
* [remove()](#API_remove)
* [ping()](#API_ping)
* [devRead()](#API_devRead)
* [devWrite()](#API_devWrite)
* [gadRead()](#API_gadRead)
* [gadWrite()](#API_gadWrite)
* [gadExec()](#API_gadExec)
* [setReportCfg()](#API_setReportCfg)
* [getReportCfg()](#API_getReportCfg)

*************************************************
<a name="API_start"></a>
### nc.start([callback])
Start the network controller.

**Arguments:**  

1. `callback` (_Function_): `function (err) { }`.  

**Returns:**  

* (none)

**Examples:** 

```js
nc.start(function (err) {
    if (err) console.log(err);
});
```

*************************************************
<a name="API_stop"></a>
### nc.stop([callback])
Stop the network controller.

**Arguments:**  

1. `callback` (_Function_): `function (err) { }`.  

**Returns:**  

* (none)

**Examples:** 

```js
nc.stop(function (err) {
    if (err) console.log(err);
});
```

*************************************************
<a name="API_reset"></a>
### nc.reset([callback])
Reset the network controller.

**Arguments:**  

1. `callback` (_Function_): `function (err) { }`.  

**Returns:**  

* (none)

**Examples:** 

```js
nc.reset(function (err) {
    if (err) console.log(err);
});
```

*************************************************
<a name="API_permitJoin"></a>
### nc.permitJoin(duration[, callback])
Let the network controller allow devices to join its network.

**Arguments:**  

1. `duration` (_Number_): Time in seconds for netcore allowing devices to join the network. Set time to 0 can immediately close the admission.  
2. `callback` (_Function_): `function (err) { }`.  

**Returns:**  

* (none)

**Examples:** 

```js
nc.permitJoin(300, function (err) {
    if (err) console.log(err);
});
```

*************************************************
<a name="API_remove"></a>
### nc.remove(permAddr[, callback])
Remove a remote device from the network.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `callback` (_Function_): `function (err) { }`.  

**Returns:**  

* (none)

**Examples:** 

```js
nc.remove('AA:BB:CC:DD:EE:FF/1', function (err) {
    if (err) console.log(err);
});
```

*************************************************
<a name="API_ping"></a>
### nc.ping(permAddr[, callback])
Ping a remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `callback` (_Function_): `function (err, result) { }`. The `result` is the approximate round trip time in milliseconds.

**Returns:**  

* (none)

**Examples:** 

```js
nc.ping('AA:BB:CC:DD:EE:FF/1', function (err, result) {
    console.log(result);    // 10 
});
```

*************************************************
<a name="API_devRead"></a>
### nc.devRead(permAddr, attrName[, callback])
Read an attribute from the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `attrName` (_String_): The attribute you want to read.
3. `callback` (_Function_): `function (err, result) { }`. The `result` is the read value.

**Returns:**  

* (none)

**Examples:** 

```js
nc.devRead('AA:BB:CC:DD:EE:FF/1', 'manufacturer', function (err, result) {
    console.log(result);    // 'freebird'
});
```

*************************************************
<a name="API_devWrite"></a>
### nc.devWrite(permAddr, attrName, value[, callback])
Write a value to an attribute to the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `attrName` (_String_): The attribute to be written.
3. `value` (_Depends_): The value to write to the attribute. 
4. `callback` (_Function_): `function (err, result) { }`. The `result` is the written value.

**Returns:**  

* (none)

**Examples:** 

```js
nc.devWrite('AA:BB:CC:DD:EE:FF/1', 'model', 'coap-7688-duo', function (err, result) {
    console.log(result);    // 'coap-7688-duo'
});
```

*************************************************
<a name="API_gadRead"></a>
### nc.gadRead(permAddr, auxId, attrName[, callback])
Remotely read an attribute from a gadget on the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.  
2. `auxId` (_String_): The auxiliary id of which gadget you want to read from.  
3. `attrName` (_String_): The attribute you want to read.  
4. `callback` (_Function_): `function (err, result) { }`. The `result` is the read value.  

**Returns:**  

* (none)

**Examples:** 

```js
nc.gadRead('AA:BB:CC:DD:EE:FF/1', 'temperature/0', 'sensorValue', function (err, result) {
    console.log(result);    // 31
});
```

*************************************************
<a name="API_gadWrite"></a>
### nc.gadWrite(permAddr, auxId, attrName, value[, callback])
Remotely write an attribute to a gadget on the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.  
2. `auxId` (_String_): The auxiliary id of which gadget you want to write to.  
3. `attrName` (_String_): The attribute to be written.  
4. `value` (_Depends_): The value to write to the attribute.  
5. `callback` (_Function_): `function (err, result) { }`. The `result` is the written value.  

**Returns:**  

* (none)

**Examples:** 

```js
nc.gadWrite('AA:BB:CC:DD:EE:FF/1', 'temperature/0', 'sensorValue', 38, function (err, result) {
    console.log(result);    // 38
});
```

*************************************************
<a name="API_gadExec"></a>
### nc.gadExec(permAddr, auxId, attrName[, args[, callback])
Issue a remote procedure call to a gadget on the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `auxId` (_String_): The auxiliary id of which gadget to perform its particular procedure.
3. `attrName` (_String_): The attribute name of an executable procedure.
4. `args` (_Array_): The arguments to the procedure.
5. `callback` (_Function_): `function (err, result) { }`. The `result` is a boolean, it will be true if operation is completed successfully, else false.

**Returns:**  

* (none)

**Examples:** 

```js
var args = [ 10 ];

nc.gadExec('AA:BB:CC:DD:EE:FF/1', 'lightCtrl/0', 'blink', args, function (err, result) {
    console.log(result);    // true
});
```

*************************************************
<a name="API_setReportCfg"></a>
### nc.setReportCfg(permAddr, auxId, attrName, cfg[, callback])
Set the report configuration to a gadget on the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `auxId` (_String_): The auxiliary id of which gadget you want to set to.
3. `attrName` (_String_): The attribute to be set report configuration.
4. `cfg` (_Object_): Parameters of the report settings.

    | Property | Type    | Required | Description |
    |----------|---------|----------|-------------|
    | pmin     | Number  | No       | Minimum Period. Minimum time in seconds the gadget should wait from the time when sending the last notification to the time when sending a new notification. |
    | pmax     | Number  | No       | Maximum Period. Maximum time in seconds the gadget should wait from the time when sending the last notification to the time sending the next notification (regardless if the value has changed). |
    | gt       | Number  | No       | Greater Than. The gadget should notify its attribute when the value is greater than this setting. Only valid for the Resource typed as a number. |
    | lt       | Number  | No       | Less Than. The gadget should notify its attribute when the value is smaller than this setting. Only valid for the Resource typed as a number. |
    | stp      | Number  | No       | Step. The gadget should notify its value when the change of the attribute value, since the last report happened, is greater than this setting. |
    | enable   | Boolean | No       | It is set to true for the gadget to start reporting an attribute. Set to false to stop reporting. |

5. `callback` (_Function_): `function (err, result) { }`. The `result` is a boolean, it will be true if operation is completed successfully, else false.

**Returns:**  

* (none)

**Examples:** 

```js
var cfg = {
    pmin: 10,
    enable: true
};

nc.setReportCfg('AA:BB:CC:DD:EE:FF/1', 'temperature/0', 'sensorValue', cfg, function (err, result) {
    console.log(result);    // true
});
```

*************************************************
<a name="API_getReportCfg"></a>
### nc.getReportCfg(permAddr, auxId, attrName[, callback])
Get the report configuration from a gadget on the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `auxId` (_String_): The auxiliary id of which gadget you want to get from.
3. `attrName` (_String_): The attribute you want to get report configuration.
4. `callback` (_Function_): `function (err, result) { }`. The `result` is report configuration settings object.

**Returns:**  

* (none)

**Examples:** 

```js
nc.getReportCfg('AA:BB:CC:DD:EE:FF/1', 'temperature/0', 'sensorValue', function (err, result) {
    console.log(result);    // {
                            //    pmin: 0,
                            //    pmax: 60
                            // }
});
```

*************************************************
