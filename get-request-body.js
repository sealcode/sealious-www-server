"use strict";
const merge = require("merge");
const Sealious = require("sealious");

const squares = {
	set: function(obj, key, value){
		const keys = key.split(/[\]\[]{1,2}/g).filter(s=>s!="");
		let current = obj;
		const last_key = keys.splice(-1)[0];
		for(const i in keys){
			if(current[keys[i]] === undefined){
				current[keys[i]] = {};
			}
			current = current[keys[i]];
		}
		current[last_key] = value;
	}
};

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
