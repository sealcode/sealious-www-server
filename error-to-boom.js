"use strict";
const Sealious = require("sealious");
const Boom = require("boom");

const error_code_map = {
	"validation": 403,
	"value_exists": 409,
	"invalid_credentials": 401,
	"not_found": 404,
	"permission": 401,
	"bad_subject": 404,
	"bad_subject_action": 405
}

function error_to_boom(error){
	const ret = Boom.wrap(error, error_code_map[error.type]);
	return ret;	
}

module.exports = error_to_boom;
