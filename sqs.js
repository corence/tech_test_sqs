
// This is just a practice attempt to make sure we know how to use the SDK in a basic fashion. It isn't part of the final test suite.

const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
    endpoint: 'http://localhost:9324',
    region: 'us-east-1',
    credentials: { 'accessKeyId': '123', 'secretAccessKey': '123' }
});

const creationParams = {
    QueueName: "CoreyQueue"
};
sqs.createQueue(creationParams, function(err, createData) {
    console.log('--- createQueue:');
    console.log(err);
    console.log(createData);

    const sendParams = {
        QueueUrl: createData.QueueUrl,
        MessageBody: "abc!"
    };
    sqs.sendMessage(sendParams, function(err, sendData) {
        console.log('--- sendMessage:');
        console.log(err);
        console.log(sendData);

        const receiveParams = {
            QueueUrl: createData.QueueUrl
        };
        sqs.receiveMessage(receiveParams, function(err, receiveData) {
            console.log('--- receiveMessage:');
            console.log(err);
            console.log(receiveData);

            receiveData.Messages.forEach(function (message) {
                const deleteParams = {
                    QueueUrl: createData.QueueUrl,
                    ReceiptHandle: message.ReceiptHandle
                };
                sqs.deleteMessage(deleteParams, function(err, deleteData) {
                    console.log('--- deleteParams:');
                    console.log(err);
                    console.log(deleteData);
                });
            });
        });
    });
});
