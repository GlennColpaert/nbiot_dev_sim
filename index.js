'use strict';
require('dotenv').config();
var readline = require('readline-sync');
const dgram = require('dgram');
const coap = require('coap');
const parse = require('coap-packet/').parse;

const ipv = 'udp' + process.env.IPV;
var server, client;

const start = () => {
	switch (process.argv[2]) {
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

			var interval = setInterval(function() {
				//sendData();
			}, process.env.TIMEOUT);
			break;
		case 'coap':
			server = coap.createServer({
				type: ipv,
			});
			server.on('request', function(req, res) {
				if (req.headers['Observe'] !== 0) return res.end(new Date().toISOString() + '\n');
/*
				var interval = setInterval(function() {
					res.write(new Date().toISOString() + '\n');
				}, 1000);

				res.on('finish', function(err) {
					clearInterval(interval);
                });
                */
				res.end('ok');
			});

			server.listen(() => {
				console.log('coap server started on port 5683');
			});

			break;
		default:
			break;
	}
};

const sendData = () => {
	let payload = JSON.stringify({
		temperature: Math.random() * (14 - 12) + 12,
	});

	client.send(payload, 0, payload.length, process.env.D2C_PORT, process.env.GW_HOST, function(err, bytes) {
		if (err) throw err;
		console.log(`${JSON.stringify(payload)} sent to ${process.env.GW_HOST}:${process.env.D2C_PORT}`);
	});
};

start();
