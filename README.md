# freebird-netcore-coap  
A CoAP machine network core for freebird framework.

[![NPM](https://nodei.co/npm/freebird-netcore-coap.png?downloads=true)](https://nodei.co/npm/freebird-netcore-coap/)  

[![Build Status](https://travis-ci.org/freebirdjs/freebird-netcore-coap.svg?branch=master)](https://travis-ci.org/freebirdjs/freebird-netcore-coap)
[![npm](https://img.shields.io/npm/v/freebird-netcore-coap.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-netcore-coap)
[![npm](https://img.shields.io/npm/l/freebird-netcore-coap.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-netcore-coap)

## Table of Contents 

1. [Overview](#Overview)  
2. [Installation](#Installation)  
3. [Basic Usage](#Usage)  
4. [License](#License)   

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
    coapCore = require('freebird-netcore-coap')();

var freebird = new Freebird([coapCore]);

// start the freebird server
freebird.start(function (err) {
    var coapCoreName = coapCore.getName();      // 'freebird-netcore-coap'

    freebird.net.permitJoin(coapCoreName, 300); // Let your coap peripheral machines join the network
});
```

<a name="License"></a>
## 4. License 

Licensed under [MIT](https://github.com/freebirdjs/freebird-netcore-coap/blob/master/LICENSE).
