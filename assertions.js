
function equal(message, expected, actual) {
	if(expected !== actual) {
        console.log('Failed assertion: ' + message + '. ' + expected + ' !== ' + actual);
        //throw Exception(message);
    }
}

function less_or_equal(message, expected, actual) {
	if(expected !== actual) {
        console.log('Failed assertion: ' + message + '. ' + expected + ' !== ' + actual);
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
module.exports.truthy = truthy;
module.exports.falsy = falsy;
