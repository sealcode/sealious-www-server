var Promise = require("bluebird");

module.exports = function(field_Type_text){

	field_Type_text.prototype.isProperValue = function(value){
		return new Promise(function(resolve, reject){
			if(this.params==undefined || this.params.max_length===undefined){
				resolve();
			}else{
				if(value.length<=this.params.max_length){
					resolve();
				}else{
					reject("Text '" + value + "' has exceeded max length of " + this.params.max_length + " chars.");
				}
			}
		}.bind(this))
	}

}
