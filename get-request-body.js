"use strict";
const merge = require("merge");
const Sealious = require("sealious");
const squares = require("squares");

function get_request_body(context, request){
	const parsed_query = {};
	for(const i in request.query){
		squares.set(parsed_query, i, request.query[i]);
	}
	for(const i in request.payload){
		squares.set(parsed_query, i, request.payload[i]);
	}
	for(var i in request.payload){
		if(request.payload[i].payload && request.payload[i].payload instanceof Buffer){
			let filename = request.payload[i].filename;
			var mime_type = request.payload[i].headers["content-type"];
			var data = request.payload[i].payload;
			parsed_query[i] = new Sealious.File(context, filename, data, null, mime_type);
		}
	}
	return parsed_query;
};

module.exports = get_request_body;
