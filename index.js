"use strict";
const stream = require("stream");
const http = require("http");
const Promise = require("bluebird");
const Sealious = require("sealious");
const Hapi = require("hapi");
const Boom = require("boom");
const merge = require("merge");

const error_to_boom = require("./error-to-boom.js");

const http_to_subject_method = {
	"GET": "show",
	"POST": "create",
	"PATCH": "edit",
	"PUT": "replace",
	"DELETE": "delete"
}

module.exports = function(App){
	const channel = App.createChip(Sealious.Channel, {name:"www-server"});
	const config = App.ConfigManager.get_config()["www-server"];
	const server = new Hapi.Server();
	server.connection({port: config.port});

	const rest_url_base = config["api-base"];

	const path = `${rest_url_base}/{elements*}`;

	function get_request_body(context, request){
		const body = merge(request.payload, request.query);
		for(var i in request.payload){
			if(request.payload[i].payload && request.payload[i].payload instanceof Buffer){
				let filename = request.payload[i].filename;
				var mime_type = request.payload[i].headers["content-type"];
				var data = request.payload[i].payload;
				body[i] = new Sealious.File(context, filename, data, null, mime_type);
			}
		}
		return body;
	};

	function handle_request(request, reply){
		try{
			const context = new Sealious.Context();
			var path_elements = request.params.elements.split('/');
			var action_name = http_to_subject_method[request.method.toUpperCase()];
			var action = new App.Action(path_elements, action_name);

			const body = get_request_body(context, request);
			return action.run(context, body)
			.then(reply)
			.catch(function(error){
				App.Logger.error(error);
				if(error instanceof Sealious.Error && error.is_user_fault){
					reply(error_to_boom(error));
				}else{
					reply(error);
				}
			});
		}catch(error){console.error(error); App.Logger.error(error); reply(error); return null;}
	};

	server.route({
		method: ["GET", "DELETE"],
		path: path,
		handler: handle_request,
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
			handler: handle_request,
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
