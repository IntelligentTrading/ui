require('./extensions')
const AWS = require('aws-sdk')
AWS.config.accessKeyId = process.env.AWS_KEY
AWS.config.secretAccessKey = process.env.AWS_SECRET

const sqs = new AWS.SQS({ region: 'us-east-1' })
var queueURL = process.env.AWS_SQS_LOCAL_QUEUE_URL

var pusher = {
    push: (messageBody) => {
        //! it's already JSON if we use the test suite
        var jsonBody = messageBody
        if (!messageBody.isJSON()) {
            jsonBody = JSON.stringify(messageBody)
        }
        var enc64Body = Buffer.from(jsonBody).toString('base64')
        var params = {
            DelaySeconds: 10,
            MessageBody: enc64Body,
            QueueUrl: queueURL
        }
        sqs.sendMessage(params, function (err, data) {
            if (err) {
                console.log('Error', err)
            } else {
                console.log('Success', data.MessageId)
            }
        })
    }
}

exports.pusher = pusher
