
function equal(message, actual, expected) {
	if(expected !== actual) {
        console.log('Failed assertion: ' + message + '. ' + actual + ' should be === ' + expected);
        //throw Exception(message);
    }
}

// assert that actual <= expected
function less_or_equal(message, actual, expected) {
	if(actual > expected) {
        console.log('Failed assertion: ' + message + '. ' + actual + ' should be <= ' + expected);
        //throw Exception(message);
    }
}

function truthy(message, actual) {
	if(!actual) {
        console.log('Failed assertion: ' + message + '. should be truthy: ' + actual);
        //throw Exception(message);
    }
}

function falsy(message, actual) {
	if(actual) {
        console.log('Failed assertion: ' + message + '. should be truthy: ' + actual);
        //throw Exception(message);
    }
}

module.exports.equal = equal;
module.exports.less_or_equal = less_or_equal;
module.exports.truthy = truthy;
module.exports.falsy = falsy;
