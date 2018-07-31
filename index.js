'use strict';
require('dotenv').config();
var readline = require('readline-sync');
const dgram = require('dgram');
const coap = require('coap');
const parse = require('coap-packet/').parse;

const ipv = 'udp' + process.env.IPV;
var server, client;
var transport = 'raw';
var observe_response;

const start = () => {
	transport = process.argv[2];
	switch (transport) {
		case 'raw':
			client = dgram.createSocket(ipv);
			server = dgram.createSocket(ipv);
			client.bind(process.env.D2C_PORT); // send telemetry on 41234
			server.bind(process.env.C2D_PORT); //
			server.on('listening', function() {
				var address = server.address();
				console.log(`UDP DEVICE listening on ${address.address}: ${address.port}`);
			});
			server.on('message', function(message, remote) {
				console.log(`${remote.address}:${remote.port} - ${message}`);
			});
			streamData();
			break;
		case 'coap':
			server = coap.createServer({
				type: ipv,
			});
			server.on('request', function(req, res) {
				console.log(req.headers);
				if (req.headers['Observe'] === 0) {
					console.log('get the value of: ' + req.url);
					observe_response = res;
					streamData();
				} else {
					//sendData();
					res.end('ok');
				}
			});
			server.listen(() => {
				console.log('coap server started on port 5683');
			});
			break;
		default:
		console.log('start with command line option raw or coap');
			break;
	}
};

const streamData = () => {
	let payload = JSON.stringify({
		temperature: Math.random() * (14 - 12) + 12,
	});

	var interval = setInterval(function() {
		if (transport === 'raw') {
			client.send(payload, 0, payload.length, process.env.D2C_PORT, process.env.GW_HOST, function(err, bytes) {
				if (err) throw err;
				console.log(`${JSON.stringify(payload)} sent to ${process.env.GW_HOST}:${process.env.D2C_PORT}`);
			});
		} else {
			res.write(payload + '\n')
		}
	}, process.env.TIMEOUT);
};

start();
