'use strict';
require('dotenv').config();
var readline = require('readline-sync');
const dgram = require('dgram');
const parse    = require('coap-packet/').parse;

const ipv = 'udp' + process.env.IPV;
var server, client;

const start = () => {
    switch (process.argv[2]) {
        case 'raw':
            client = dgram.createSocket(ipv);
            server = dgram.createSocket(ipv);
            client.bind(process.env.D2C_PORT); // send telemetry on 41234
            server.bind(process.env.C2D_PORT); // 
            server.on('listening', function () {
                var address = server.address();
                console.log(`UDP DEVICE listening on ${address.address}: ${address.port}`);
            });
            server.on('message', function (message, remote) {
                console.log(`${remote.address}:${remote.port} - ${message}`);
            });

            var interval = setInterval(function () {
                //sendData();
            }, process.env.TIMEOUT);
            break;
        case 'coap':
        server = dgram.createSocket(ipv);
        server.bind(5683); // 
        server.on('listening', function () {
            var address = server.address();
            console.log(`COAP DEVICE listening on ${address.address}: ${address.port}`);
        });
        server.on('message', function (data, remote) {
            console.log(`${remote.address}:${remote.port} - ${data}`);
            console.log(parse(data).payload.toString())
            server.close();
        });
        /*
            server = coap.createServer({
                type: ipv
            });
            server.on('request', function (req, res) {
                console.log(req)
                console.log('coap request received: ' + req.url);
                //let nodeTime = new Date().toISOString();
                //var value = (Math.random() * (16 - 15) + 15).toFixed(4);
                //console.log(`time stamp: ${nodeTime}\nvalue: ${value}`);

                res.end('ok');
            });

            server.listen(() => {
                console.log('coap server started on port 5683');
            });
            */
            break;
        default:
            break;
    }
}

const sendData = () => {
    let payload = JSON.stringify({
        temperature: Math.random() * (14 - 12) + 12
    });

    client.send(payload, 0, payload.length, process.env.D2C_PORT, process.env.GW_HOST, function (err, bytes) {
        if (err) throw err;
        console.log(`${JSON.stringify(payload)} sent to ${process.env.GW_HOST}:${process.env.D2C_PORT}`);
    })
}

start();