const assert = require('./assertions.js');
const AWS = require('aws-sdk');

function initSQS() {
    'use strict';
    
    return new AWS.SQS({
        endpoint: 'http://localhost:9324',
        region: 'us-east-1',
        credentials: { 'accessKeyId': '123', 'secretAccessKey': '123' }
    });
}

function testManyMessages() {
    'use strict';
    
    // We will send 1000 messages
    const dataToSend = [];
    for(let i = 0; i < 1000; ++i) {
        dataToSend.push('Message ' + i);
    }
    let numMessagesSent = 0;

    // ...and receive them here.
    const dataReceived = {};
    let numMessagesReceived = 0;

    const sqs = initSQS();
    sqs.createQueue({QueueName: 'Queue_for_many_messages'}, function(err, createData) {
        assert.falsy(err); // if errors come up here then we either have a configuration error or something sporadic like a network error. May need to rethink this if intermittent failures come up

        console.log('Sending ' + dataToSend.length + ' messages...');

        // Send all of the messages
        dataToSend.forEach(function (message) {
            sqs.sendMessage({
                QueueUrl: createData.QueueUrl,
                MessageBody: message
            }, function(err, sendData) {
                assert.falsy(err);
                ++numMessagesSent;
            });
        });

        const receiveCallback = function receiveCallback(err, receiveData) {
            assert.falsy(err);

            receiveData.Messages.forEach(function (receivedMessage) {
                // Each of the messages has a distinct body.
                // Therefore -- If we haven't received a message with this body before, then record it and count it
                if(!dataReceived[receivedMessage.Body]) {
                    dataReceived[receivedMessage.Body] = true;
                    ++numMessagesReceived;
                }

                // Delete the message from the SQS queue
                sqs.deleteMessage({
                    QueueUrl: createData.QueueUrl,
                    ReceiptHandle: receivedMessage.ReceiptHandle
                }, function(err, deletedData) {
                    assert.falsy(err);
                });
            });

            // Make sure we haven't received more (distinct) messages than we have sent!
            assert.less_or_equal(dataToSend.length, numMessagesReceived);

            // If we haven't received all of the messages yet
            if (numMessagesReceived < dataToSend.length) {
                // call receiveMessage again! Each receiveMessage can return between 0 and 9 messages so the docs suggest to call it repeatedly if we want to get all of the relevant messages.
                sqs.receiveMessage({
                    QueueUrl: createData.QueueUrl
                }, receiveCallback);
            } else {
                console.log('Received all ' + dataToSend.length + ' messages.');
            }
        };

        // Get the first Receive started
        console.log('Receiving ' + dataToSend.length + ' messages...');
        sqs.receiveMessage({
            QueueUrl: createData.QueueUrl
        }, receiveCallback);
    });
}

testManyMessages();
