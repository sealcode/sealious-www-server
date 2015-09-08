var Sealious = require("../../sealious");
var Promise = require("bluebird");
var Color = require("color");

var field_type_color = new Sealious.ChipTypes.FieldType("color");

field_type_color.prototype.isProperValue = function(value_in_code){
	return new Promise(function(resolve, reject){
		try{
			Color(value_in_code.toLowerCase());
		} catch(e){
			reject("Value `" + value_in_code + "` could not be parsed as a color.");
		}
		resolve();
	})
}

field_type_color.prototype.encode = function(value_in_code){
	var color = Color(value_in_code);

	return new Promise(function(resolve, reject){
		resolve(color.hexString()); //color in hex
	})
}