const assert = require('./assertions.js');
const utils = require('./sqs_utils.js');

function testSendWithDelaySeconds() {
    'use strict';
    
    const sqs = utils.initSQS();
    utils.createQueue(sqs, 'Queue_testSendWithDelaySeconds', function(QueueUrl) {
        const timeOfSending = Date.now(); // i'd rather check this here instead of in the sendMessage callback because of the _slight_ possibility that the callback could be delayed for some reason
        sqs.sendMessage({
            QueueUrl: QueueUrl,
            MessageBody: 'abc',
            DelaySeconds: 4
        }, function(err, sendData) {
            assert.falsy('message should send OK', err);
        });

        const receive = function receive() {
            sqs.receiveMessage({
                QueueUrl: QueueUrl,
                WaitTimeSeconds: 1 // this improves the test performance by avoiding polling too often, but the test should work without it
            }, function(err, receiveData) {
                assert.falsy('message should receive OK', err);
                if(receiveData.Messages) {
                    assert.less_or_equal('we sent with a delay of 4000 milliseconds, so we should be more than 4 seconds in the future from that time',
                        timeOfSending + 4000, Date.now());
                } else {
                    receive();
                }
            });
        };
    });
}
testSendWithDelaySeconds();

function testErrorForSendWithDelayTooBig() {
    'use strict';
    
    const sqs = utils.initSQS();
    utils.createQueue(sqs, 'Queue_testErrorForSendWithDelayTooBig', function(QueueUrl) {
        sqs.sendMessage({
            QueueUrl: QueueUrl,
            MessageBody: 'abc',
            DelaySeconds: 901
        }, function(err, sendData) {
            assert.truthy('An error should be raised if we sendMessage with a delay over 900 seconds', err);
            // I assume that this should raise an error according to http://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html
            // However, it doesn't raise an error in my tests. So I _guess_ this means that ElasticMQ doesn't cover this case in its error handling.
        });
    });
}
testErrorForSendWithDelayTooBig();

function testSendExtendedAscii() {
    'use strict';

    // Testing this part of the SQS spec:
    // The following Unicode characters are allowed:
    // #x9 | #xA | #xD | #x20 to #xD7FF | #xE000 to #xFFFD | #x10000 to #x10FFFF
    // Any characters not included in this list will be rejected.

    utils.sendAndReceive(
            { MessageBody: '\xDD' },
            {},
            function(message) {
                assert.equal('message body should be intact after sending', message.Body, '\xDD');
            });
}
testSendExtendedAscii();

function testSendBMPUnicode() {
    'use strict';

    utils.sendAndReceive(
            { MessageBody: '\uCCCC' },
            {},
            function(message) {
                assert.equal('message body should be intact after sending', message.Body, '\uDDDD');
            });
}
testSendBMPUnicode();

function testSendAstralUnicode() {
    'use strict';

    utils.sendAndReceive(
            { MessageBody: '\u{13456}' },
            {},
            function(message) {
                assert.equal('message body should be intact after sending', message.Body, '\u{13456}');
            });
}
testSendAstralUnicode();

function testSendPoopUnicode() {
    'use strict';

    utils.sendAndReceive(
            { MessageBody: '💩' },
            {},
            function(message) {
                assert.equal('message body should be intact after sending', message.Body, '💩');
            });
}
testSendPoopUnicode();
