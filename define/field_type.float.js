var Promise = require("bluebird");

module.exports = function(field_type_float) {

    field_type_float.prototype.isProperValue = function(number) {
        var test = parseFloat(number);
        var test_2 = isNaN(number);

        return new Promise(function(resolve, reject) {
            try {
                if (test === null || test === NaN || test_2 === true) throw e;
            } catch (e) {
                reject("Value `" + number + "` is not a float number format.");
            }
            resolve();
        })
    }

    field_type_float.prototype.encode = function(number) {
        return new Promise(function(resolve, reject) {
            resolve(parseFloat(number));
        })
    }
}