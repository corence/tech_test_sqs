
function assertEqual(message, expected, actual) {
	if(expected !== actual) {
        console.log('Failed assertion: ' + message + ': ' + expected + ' !== ' + actual);
        //throw Exception(message);
    }
}

assertEqual('3 should be calculable', 6, 3 * 2);
assertEqual('this should fail', 4, "4");
