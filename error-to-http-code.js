var Sealious = require("sealious");

var error_code_map = new Map();

error_code_map = {
	"validation": 403,
	"value_exists": 409,
	"invalid_credentials": 401,
	"not_found": 404,
	"permission": 401,
	"bad_subject": 404,
	"bad_subject_action": 405
}

function error_to_http_code(error){
	if(error.type){
		return error_code_map[error.type] || 500;
	}else{
		return 500;
	}
}

module.exports = error_to_http_code;
