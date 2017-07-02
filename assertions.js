
// I wrote this assertion library because I was having trouble getting npm to install mocha and I didn't want to spend more time trying to fix it.
// In reality I'd spend the extra time and get mocha/chai running, so this would be unneccessary.

// We are going to assume that our assertions are the only things throwing exceptions, because this is a 5-minute assertion library
var uncaughtExceptionCount = 0;
process.on('uncaughtException', function (err) {
    ++uncaughtExceptionCount;
    console.log('');
    console.log('---> ' + uncaughtExceptionCount);
    console.log(err);
    console.log(err.stack);
})

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

module.exports = {
    equal,
    less_or_equal,
    truthy,
    falsy
};
