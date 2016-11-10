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
		
		return extract_context(app, request)
		.then(function(context){
			let body = get_request_body(context, request);
			return action.run(context, body);
		})
		.then(function(response){
			if(response instanceof app.Sealious.File){
				reply.file(response.path_on_hdd);
			}else if(response instanceof app.Sealious.Responses.NewSession){
				reply(response).state(config["session-cookie-name"], response.metadata.session_id);
			}else if(response instanceof app.Sealious.Responses.ResourceCreated){
				reply(response).code(201);
			} else {
				reply(response);
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
