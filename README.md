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
 * [Netcore Class](#API_netcoreClass)  
 * [Device Class](#API_deviceClass)  
 * [Gadget Class](#API_gadgetClass)  

<a name="Overview"></a>
## 1. Overview 

**freebird-netcore-coap** 

<a name="Installation"></a>
## 2. Installation 

> $ npm install freebird-netcore-coap --save

<a name="Usage"></a>
## 3. Basic Usage 

```js

```

<a name="APIs"></a>
## 4. APIs 

#### 1. Netcore APIs

* [nc.start()](#API_start)
* [nc.stop()](#API_stop)
* [nc.reset()](#API_reset)
* [nc.permitJoin()](#API_permitJoin)
* [nc.remove()](#API_remove)
* [nc.ping()](#API_ping)

#### 2. Device APIs

* [dev.read()](#API_devRead)
* [dev.write()](#API_devWrite)

#### 3. Gadget APIs

* [gad.read()](#API_devRead)
* [gad.write()](#API_devWrite)
* [gad.exec()](#API_devExec)
* [gad.setReportCfg()](#API_devSetReportCfg)
* [gad.getReportCfg()](#API_devGetReportCfg)

*************************************************
<a name="API_netcoreClass"></a>
## Netcore Class


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
nc.remove('AA:BB:CC:DD:EE:FF', function (err) {
    if (err) console.log(err);
});
```

*************************************************
<a name="API_ping"></a>
### nc.ping(permAddr[, callback])
Ping a remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `callback` (_Function_): `function (err, result) { }`.  

**Returns:**  

* (none)

**Examples:** 

```js
nc.ping('AA:BB:CC:DD:EE:FF', function (err, result) {
    console.log(result);    // 10 
});
```

*************************************************

<br /> 

<a name="API_deviceClass"></a>
## Device Class


<a name="API_devRead"></a>
### dev.read(permAddr, attrName[, callback])
Read an attribute from the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `attrName` (_String_): The attribute you want to read.
3. `callback` (_Function_): `function (err) { }`.  

**Returns:**  

* (none)

**Examples:** 

```js
dev.read('AA:BB:CC:DD:EE:FF', 'manufacturer', function (err, result) {
    console.log(result);    // 'freebird'
});
```

*************************************************
<a name="API_devWrite"></a>
### dev.write(permAddr, attrName, value[, callback])
Write a value to an attribute to the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `attrName` (_String_): The attribute to be written.
3. `value` (_Depends_): The value to write to the attribute. 
4. `callback` (_Function_): `function (err) { }`.  

**Returns:**  

* (none)

**Examples:** 

```js
dev.write('AA:BB:CC:DD:EE:FF', 'model', 'coap-7688-duo', function (err, result) {
    console.log(result);    // 'coap-7688-duo'
});
```

*************************************************

<br /> 

<a name="API_gadgetClass"></a>
## Gadget Class


<a name="API_gadRead"></a>
### gad.read(permAddr, auxId, attrName[, callback])
Remotely read an attribute from a gadget on the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `auxId` (_String_): The auxiliary id of which gadget you want to read from.
3. `attrName` (_String_): The attribute you want to read.
4. `callback` (_Function_): `function (err) { }`.   

**Returns:**  

* (none)

**Examples:** 

```js
gad.read('AA:BB:CC:DD:EE:FF', 'temperature/0', 'sensorValue', function (err, result) {
    console.log(result);    // 31
});
```

*************************************************
<a name="API_gadWrite"></a>
### gad.write(permAddr, auxId, attrName, value[, callback])
Remotely write an attribute to a gadget on the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.  
2. `auxId` (_String_): The auxiliary id of which gadget you want to write to.
3. `attrName` (_String_): The attribute to be written.
4. `value` (_Depends_): The value to write to the attribute.  
5. `callback` (_Function_): `function (err) { }`.  

**Returns:**  

* (none)

**Examples:** 

```js
gad.write('AA:BB:CC:DD:EE:FF', 'temperature/0', 'sensorValue', 38, function (err, result) {
    console.log(result);    // 38
});
```

*************************************************
<a name="API_gadExec"></a>
### gad.exec(permAddr, auxId, attrName[, args[, callback])
Issue a remote procedure call to a gadget on the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `auxId` (_String_): The auxiliary id of which gadget to perform its particular procedure.
3. `attrName` (_String_): The attribute name of an executable procedure.
4. `args` (_Array_): The arguments to the procedure.
5. `callback` (_Function_): `function (err) { }`.  

**Returns:**  

* (none)

**Examples:** 

```js
var args = [ 10 ];

gad.exec('AA:BB:CC:DD:EE:FF', 'lightCtrl/0', 'blink', args, function (err, result) {
    console.log(result);    // true
});
```

*************************************************
<a name="API_setReportCfg"></a>
### gad.setReportCfg(permAddr, auxId, attrName, cfg[, callback])
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

5. `callback` (_Function_): `function (err) { }`.  

**Returns:**  

* (none)

**Examples:** 

```js
var cfg = {
    pmin: 10,
    enable: true
};

gad.setReportCfg('AA:BB:CC:DD:EE:FF', 'temperature/0', 'sensorValue', cfg, function (err, result) {
    console.log(result);    // true
});
```

*************************************************
<a name="API_gadGetReportCfg"></a>
### gad.getReportCfg(permAddr, auxId, attrName[, callback])
Get the report configuration from a gadget on the remote device.

**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device.
2. `auxId` (_String_): The auxiliary id of which gadget you want to get from.
3. `attrName` (_String_): The attribute you want to get report configuration.
4. `callback` (_Function_): `function (err) { }`.   

**Returns:**  

* (none)

**Examples:** 

```js
gad.getReportCfg('AA:BB:CC:DD:EE:FF', 'temperature/0', 'sensorValue', function (err, result) {
    console.log(result);    // {
                            //    pmin: 0,
                            //    pmax: 60
                            // }
});
```

*************************************************
