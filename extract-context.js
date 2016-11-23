"use strict";
const Sealious = require("sealious");
	const uuid = require("uuid");

function extract_context(app, request){
	const config = app.ConfigManager.get_config()["www-server"];
	const cookie_name = config["session-cookie-name"];
	const anon_cookie_name = config["anonymous-cookie-name"];
	var d = new Date();
	var timestamp = d.getTime();
	var ip = request.info.remoteAddress;
	const session_id = request.state[cookie_name];
	const anon_session_is_new = request.state[anon_cookie_name] === undefined;
	const anonymous_session_id = request.state[anon_cookie_name] || uuid.v4();
	return app.run_action(
		new Sealious.SuperContext(),
		["collections", "sessions"],
		"show",
		{filter:{"session-id": session_id}}
	)
	.then(function(results){
		if(results.length === 0){
			return new Sealious.Context(timestamp, ip, undefined, undefined, anonymous_session_id, anon_session_is_new);
		}else{
			return new Sealious.Context(timestamp, ip, results[0].body.user, session_id, anonymous_session_id, anon_session_is_new);
		}
	});
};

module.exports = extract_context;
