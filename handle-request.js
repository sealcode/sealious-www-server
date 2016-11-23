"use strict";
const Sealious = require("sealious");
const get_request_body = require("./get-request-body.js");
const http_to_subject_method = require("./http-to-method-name.js");
const error_to_boom = require("./error-to-boom.js");
const extract_context = require("./extract-context.js");

function handle_request(app, request, reply){
	try{
		const config = 	app.ConfigManager.get_config()["www-server"];
		var path_elements = request.params.elements.split('/');
		var action_name = http_to_subject_method[request.method.toUpperCase()];
		var action = new app.Action(path_elements, action_name);
		let context = null;
		
		return extract_context(app, request)
		.then(function(_context){
			context = _context;
			let body = get_request_body(context, request);
			return action.run(context, body);
		})
		.then(function(response){
			let rep = null;
			if(response instanceof app.Sealious.File){
				rep = reply.file(response.path_on_hdd).type(response.mime);
			}else if(response instanceof app.Sealious.Responses.NewSession){
				rep = reply(response).state(config["session-cookie-name"], response.metadata.session_id);
			}else if(response instanceof app.Sealious.Responses.ResourceCreated){
				rep = reply(response).code(201);
			} else {
				rep = reply(response);
			}
			if(context.anon_session_is_new){
				rep.state(config["anonymous-cookie-name"], context.anonymous_session_id);
			}
		})
		.catch(function(error){
			app.Logger.error(error);
			if(error instanceof Sealious.Error && error.is_user_fault){
				reply(error_to_boom(error));
			}else{
				reply(error);
			}
		});
	}catch(error){
		app.Logger.error(error); 
		reply(error); 
		return null;
	}
};

module.exports = handle_request;
