
function equal(message, actual, expected) {
	if(expected !== actual) {
        throw new Error('Failed assertion: ' + message + '. ' + actual + ' should be === ' + expected);
        //throw Exception(message);
    }
}

// assert that actual <= expected
function less_or_equal(message, actual, expected) {
	if(actual > expected) {
        throw new Error('Failed assertion: ' + message + '. ' + actual + ' should be <= ' + expected);
        //throw Exception(message);
    }
}

function truthy(message, actual) {
	if(!actual) {
        throw new Error('Failed assertion: ' + message + '. should be truthy: ' + actual);
        //throw Exception(message);
    }
}

function falsy(message, actual) {
	if(actual) {
        throw new Error('Failed assertion: ' + message + '. should be falsy: ' + actual);
        //throw Exception(message);
    }
}

module.exports.equal = equal;
module.exports.less_or_equal = less_or_equal;
module.exports.truthy = truthy;
module.exports.falsy = falsy;
