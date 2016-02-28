var Sealious = require("sealious");

var error_code_map = new Map();

error_code_map.set(Sealious.Errors.ValidationError, 403);
error_code_map.set(Sealious.Errors.ValueExists, 409);
error_code_map.set(Sealious.Errors.InvalidCredentials, 401);
error_code_map.set(Sealious.Errors.NotFound, 404);
error_code_map.set(Sealious.Errors.UnauthorizedRequest, 401);
error_code_map.set(Sealious.Errors.BadContext, 401);
error_code_map.set(Sealious.Errors.BadSubjectPath, 404);
error_code_map.set(Sealious.Errors.BadSubjecAction, 405);



function error_to_http_code(error){
	var code_from_map = error_code_map.get(error.prototype.constructor);
	if(code_from_map != undefined){
		return code_from_map;
	}else{
		return 500;
	}
}
