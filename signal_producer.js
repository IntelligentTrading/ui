const AWS = require('aws-sdk');
AWS.config.accessKeyId = process.env.AWS_KEY;
AWS.config.secretAccessKey = process.env.AWS_SECRET;

const sqs = new AWS.SQS({ region: 'us-east-1' });
var queueURL = 'https://sqs.us-east-1.amazonaws.com/983584755688/intelligenttrading-sqs-production'; //process.env.SQS_PROD;


var messageBody = {
    type: "trade signal",
    coin: "ETH",
    risk: "high",
    signal: "SMA",
    trend: "1",
    strength: "2",
    strength_max: "3",
    horizon: "medium",
    price: "0.00045",
    price_change: "0.012"
};

var params = {
    DelaySeconds: 10,
    MessageBody: JSON.stringify(messageBody),
    QueueUrl: queueURL
};

sqs.sendMessage(params, function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data.MessageId);
    }
});