var Promise = require("bluebird");

module.exports = function(field_type_float) {

    field_type_float.prototype.isProperValue = function(date) {
        //YYYY-MM-DD
        return new Promise(function(resolve, reject) {

            var date_in_string = date.toString();

            var regex_per_day = /^[1-2][0-9]{3}-([1-9]|0[1-9]|1[0-2])-([1-9]|0[1-9]|1[0-9]|2[0-9]|30|31)$/; //granulation_per_day
			var regex_per_time = //granulation_per_time
 

            if (regex.test(date_in_string) != true ||) {
                reject(date + " is not date calendar format. Expected value standard IS0 8601 - (YYYY-MM-DD) for date without time or ...");
            } else {
                resolve();
            }
        })
    }

    field_type_float.prototype.encode = function(date) {
        return new Promise(function(resolve, reject) {
            resolve(Date.parse(date));
        })
    }
}
