var Promise = require("bluebird");

module.exports = function(field_type_datetime) {

    field_type_datetime.prototype.isProperValue = function(datetime) {
        return new Promise(function(resolve, reject) {
            var parsed_datetime = parseInt(datetime);

            var regex = /^(-[1-9]{1,11})$|^([0-9]|[1-9][0-9]*)$/; //granulation_per_timestamp

                if (regex.test(parsed_datetime) === false) {
                    reject("`"+datetime+"`" + " is not datetime format. Expected value is timestamp.");
                } else {
                    resolve();
                }
        })
    }

    field_type_datetime.prototype.encode = function(datetime) {
        return new Promise(function(resolve, reject) {
            var parsed_datetime = parseInt(datetime);
            resolve(parsed_datetime);
        })
    }
}