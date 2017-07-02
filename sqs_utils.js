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

// Utility method to send a message and then receive it immediately
function sendAndReceive(sendParams, receiveParams, messageCallback) {
    'use strict';

    const sqs = initSQS();
    createQueue(sqs, 'arbitrary', function(QueueUrl) {
        sendParams = Object.assign({QueueUrl}, sendParams);
        sqs.sendMessage(sendParams, function(err, sendData) {
            assert.falsy('message should send OK', err);

            receiveParams = Object.assign({
                QueueUrl,
                WaitTimeSeconds: 3
            }, receiveParams);
            sqs.receiveMessage(receiveParams, function(err, receiveData) {
                assert.falsy('message should receive OK', err);
                
                receiveData.Messages.forEach(function (receivedMessage) {
                    if (messageCallback) {
                        messageCallback(receivedMessage);
                    }
                    
                    // Delete the message from the SQS queue
                    sqs.deleteMessage({
                        QueueUrl: createData.QueueUrl,
                        ReceiptHandle: receivedMessage.ReceiptHandle
                    }, function(err, deletedData) {
                        assert.falsy(err);
                    });
                });
            });
        });
    });
}

module.exports = {
    initSQS,
    createQueue,
    sendAndReceive
};
