var proxy = require('../lib/proxy.js');
var os = require('os');
var ifaces = os.networkInterfaces();

var PROXY_PORT = 8888;
var myProxy = proxy.createProxyServer({ port: PROXY_PORT });

printAddresses();
console.log('port : '+ PROXY_PORT);

// Whether or not to enable custom intercepting at all.
myProxy.on('shouldEnableInterception', function (callback) {
    callback(false);
});

// Whether or not we should intercept and buffer the proxy response
// The default is to buffer all HTML responses.
myProxy.on('shouldInterceptResponseContent', function (proxyResponse, callback) {
    var isHtml = (proxyResponse.headers['content-type'] &&
                  proxyResponse.headers['content-type'].toLowerCase().indexOf("html") != -1);
    callback(isHtml);
});

// You can rewrite the request as it's being sent to the remote server.
// (just headers)
myProxy.on('interceptRequest', function (requestInfo, callback) {
   // requestInfo is the same as the arguments to http.request
   console.log( requestInfo.host, requestInfo.path);
   callback(requestInfo);
});

// You can change response headers
myProxy.on('interceptResponseHeaders', function (requestInfo, statusCode, headers, callback) {
    callback(statusCode, headers);
});

// You can alter any response body that you said you want to intercept in "shouldInterceptResponse"
// by default this is all HTML responses if 'enabledCheck' is true (default)
// The response object is the standard node http response object.
myProxy.on('interceptResponseContent', function (buffer, response, isSsl, charset, callback) {
    callback(buffer);
});


myProxy.on('error', function (error, locationInfo) {
   console.log(locationInfo);
   console.log(error.stack);
});


function printAddresses(){
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false ) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(ifname + ':' + alias, iface.address);
            } else {
                // this interface has only one ipv4 adress
                console.log(ifname + ':' + iface.address);
            }
            ++alias;
        });
    });
}