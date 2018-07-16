'use strict';
require('dotenv').config();
var readline = require('readline-sync');
const dgram = require('dgram');
const ipv = 'udp'+process.env.IPV;
var client = dgram.createSocket(ipv);
var server = dgram.createSocket(ipv);
client.bind(process.env.D2C_PORT); // send telemetry on 41234
server.bind(process.env.C2D_PORT); // receive meessages on 41235

const start = () => {
    var interval = setInterval(function () {
        sendData();
    }, process.env.TIMEOUT);
}

const sendData = () => {
    let payload = JSON.stringify({temperature: Math.random() * (14 - 12) + 12});

    client.send(payload, 0, payload.length, process.env.D2C_PORT, process.env.GW_HOST, function (err, bytes) {
        if (err) throw err;
        console.log(`${JSON.stringify(payload)} sent to ${process.env.GW_HOST}:${process.env.D2C_PORT}`);
    });
}

server.on('listening', function () {
    var address = server.address();
    console.log(`UDP DEVICE listening on ${address.address}: ${address.port}`);
});

server.on('message', function (message, remote) {
    console.log(`${remote.address}:${remote.port} - ${message}`);
});


start();