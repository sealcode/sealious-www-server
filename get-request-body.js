"use strict";
const merge = require("merge");
const Sealious = require("sealious");

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

module.exports = get_request_body;
