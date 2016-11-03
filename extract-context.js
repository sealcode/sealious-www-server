"use strict";
const Sealious = require("sealious");

function extract_context(app, request){
	const config = app.ConfigManager.get_config()["www-server"];
	const cookie_name = config["session-cookie-name"];
	var d = new Date();
	var timestamp = d.getTime();
	var ip = request.info.remoteAddress;
	const session_id = request.state[cookie_name];
	return app.run_action(new Sealious.SuperContext(), ["collections", "sessions"], "show", {filter:{"session-id": session_id}})
	.then(function(results){
		if(results.length === 0){
			return new Sealious.Context(timestamp, ip, undefined);
		}else{
			return new Sealious.Context(timestamp, ip, results[0].body.user);
		}
	});
};

module.exports = extract_context;
