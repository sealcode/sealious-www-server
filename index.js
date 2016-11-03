"use strict";
const stream = require("stream");
const http = require("http");
const Promise = require("bluebird");
const Sealious = require("sealious");
const Hapi = require("hapi");
const Boom = require("boom");
const merge = require("merge");

const handle_request = require("./handle-request.js");

module.exports = function(App){
	const channel = App.createChip(Sealious.Channel, {name:"www-server"});
	const config = App.ConfigManager.get_config()["www-server"];
	const server = new Hapi.Server();
	server.connection({port: config.port});

	const rest_url_base = config["api-base"];

	const path = `${rest_url_base}/{elements*}`;

	server.state(config["session-cookie-name"], {
		ttl: 24 * 60 * 60 * 1000,     // One day
		path: '/',
		isSecure: false,
	});

	server.route({
		method: ["GET", "DELETE"],
		path: path,
		handler: handle_request.bind({}, App),
	});

	server.route({
		method: ["PATCH", "PUT", "POST"],
		path: path,
		config: {
			payload: {
				multipart: {
					output: "annotated",
				},
			},
			handler: handle_request.bind({}, App),
		}
	});

	channel.start = function(){
		return new Promise(function(resolve, reject){
			server.start(function(err){
				if (err) {
					throw err;
				}
				console.log(`Server running at: ${server.info.uri}`);
				resolve();
			});
		});
	};
	
};
