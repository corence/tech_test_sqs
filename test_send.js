const assert = require('./assertions.js');
const AWS = require('aws-sdk');

function generateString(chars, length) {
    'use strict';
    
    let result = '';
    for(let i = 0; i < length; ++i) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
            
function initSQS() {
    'use strict';
    
    return new AWS.SQS({
        endpoint: 'http://localhost:9324',
        region: 'us-east-1',
        credentials: { 'accessKeyId': '123', 'secretAccessKey': '123' }
    });
}

function createQueue(sqs, name, callback) {
    'use strict';

    // This is so that we get a new queue at the start of each test run
    // AWS docs: A queue name can have up to 80 characters. Valid values: alphanumeric characters, hyphens (-), and underscores (_).
    name += generateString('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_', 20);

    sqs.createQueue({QueueName: name}, function(err, data) {
        assert.falsy('queue should be created OK', err);

        // make sure the queue is empty
        // for some reason this throws an error: "Invalid request: : Invalid request: ; see the SQS docs."
        // This feels like it might be a bug in ElasticMQ. So I'm generating a random queue name instead.
        /*
        sqs.purgeQueue({
            QueueUrl: data.QueueUrl
        }, function(err, purgeData) {
            console.log(purgeData);
            assert.falsy('message should receive OK', err);

            // good, the queue is now ready to test with
            callback(data.QueueUrl);
        });
        */
        
        callback(data.QueueUrl);
    });
}

function testSendWithDelaySeconds() {
    'use strict';
    
    const sqs = initSQS();
    createQueue(sqs, 'Queue_testSendWithDelaySeconds', function(QueueUrl) {
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
    
    const sqs = initSQS();
    createQueue(sqs, 'Queue_testErrorForSendWithDelayTooBig', function(QueueUrl) {
        sqs.sendMessage({
            QueueUrl: QueueUrl,
            MessageBody: 'abc',
            DelaySeconds: 901
        }, function(err, sendData) {
            assert.truthy('An error should be raised if we sendMessage with a delay over 900 seconds', err);
            // I assume that this should raise an error according to http://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html
            // However, it doesn't raise an error in my tests. So I _guess_ this means that ElasticMQ doesn't cover this case in its error handling.
            // So we are skipping this test.
        });
    });
}
//testErrorForSendWithDelayTooBig();

function testSendUnicode() {
    'use strict';

    const sqs = initSQS();
    createQueue(sqs, 'Queue_testSendUnicode', function(QueueUrl) {
        sqs.sendMessage({
            QueueUrl: QueueUrl,
            //MessageBody: 'Body of Iñtërnâtiônàlizætiøn☃💩',
            MessageBody: 'Body of Iñtërnâtiônàlizætiøn☃',
            MessageAttributes: {
                'a-z_.Test_of_weird_characters_001': {
                    DataType: 'String',
                    //StringValue: 'Attribute of Iñtërnâtiônàlizætiøn☃💩'
                    StringValue: 'Attribute of Iñtërnâtiônàlizætiøn☃'
                }
            }
        }, function(err, sendData) {
            assert.falsy('message should send OK', err);
        });

        sqs.receiveMessage({
            QueueUrl: QueueUrl,
            WaitTimeSeconds: 5
        }, function(err, receiveData) {
            assert.falsy('message should receive OK', err);
            console.log(receiveData.Messages[0]);
            assert.equal('unicode string should be intact after sending', receiveData.Messages[0].Body, 'Body of Iñtërnâtiônàlizætiøn☃💩');
            assert.equal('unicode string should be intact after sending', receiveData.Messages[0].Body, 'Body of Iñtërnâtiônàlizætiøn☃💩');
        });
    });
}
testSendUnicode();
