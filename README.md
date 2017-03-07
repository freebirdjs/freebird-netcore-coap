# freebird-netcore-coap  
A CoAP machine network core for freebird framework.

[![NPM](https://nodei.co/npm/freebird-netcore-coap.png?downloads=true)](https://nodei.co/npm/freebird-netcore-coap/)  

[![Build Status](https://travis-ci.org/freebirdjs/freebird-netcore-coap.svg?branch=master)](https://travis-ci.org/freebirdjs/freebird-netcore-coap)
[![npm](https://img.shields.io/npm/v/freebird-netcore-coap.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-netcore-coap)
[![npm](https://img.shields.io/npm/l/freebird-netcore-coap.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-netcore-coap)

</br>

<a name="Documentation"></a>
## Documentation 
Please visit the [Wiki](https://github.com/freebirdjs/freebird-netcore-coap/wiki).

<a name="Overview"></a>
## Overview 

**freebird-netcore-coap** is the network controller (netcore) with managment facilities ready for [freebird](https://github.com/freebirdjs/freebird) IoT framework.

<a name="Installation"></a>
## Installation 

> $ npm install freebird-netcore-coap --save

<a name="Usage"></a>
## Basic Usage 

```js
var Freebird = require('freebird'),
    coapCore = require('freebird-netcore-coap')();

// Create the freebird server and register the freeebird-netcore-coap to it
var freebird = new Freebird([coapCore]);

// Start the freebird server
freebird.start(function (err) {
	// Let your coap machines join the network
    freebird.net.permitJoin(180); 
});

// That's it!
```

<a name="License"></a>
## License 

Licensed under [MIT](https://github.com/freebirdjs/freebird-netcore-coap/blob/master/LICENSE).
