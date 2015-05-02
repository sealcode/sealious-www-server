var Promise = require("bluebird");

module.exports = function(field_type_float) {

    field_type_float.prototype.isProperValue = function(number) {
        var test = parseFloat(number);

        return new Promise(function(resolve, reject) {
            if (test === null || test === NaN || isNaN(number) === true) {
                reject("Value `" + number + "` is not a float number format.");
            } else {
                resolve();
            }
        })
    }

    field_type_float.prototype.encode = function(number) {
        return new Promise(function(resolve, reject) {
            resolve(parseFloat(number));
        })
    }
}