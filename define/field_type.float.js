var Promise = require("bluebird");
var isFloat = require("is-float");

module.exports = function(field_type_float) {

    field_type_float.prototype.isProperValue = function(number) {
        var test_1 = parseFloat(number);
        var test_2 = isFloat(number);

        return new Promise(function(resolve, reject) {
            try {
                if (test_1 === null || test_2 === false) throw e;
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