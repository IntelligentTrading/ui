const signalNotifier = require('./events/signals')
const signalHelper = require('./util/signal-helper')
const Consumer = require('sqs-consumer')
const AWS = require('aws-sdk')

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET
})

console.log('Starting telegram dispatching service');

var aws_queue_url = process.env.LOCAL_ENV
  ? `${process.env.AWS_SQS_LOCAL_QUEUE_URL}`
  : `${process.env.AWS_SQS_QUEUE_URL}`;

const app = Consumer.create({
  queueUrl: aws_queue_url,
  handleMessage: (message, done) => {
    var signalValidity = signalHelper.checkValidity(message)

    if (signalValidity.isValid) {
      signalNotifier.notify(signalValidity.decoded_message_body).then((msg) => {
        console.log(`[Notified] Message ${message.MessageId}`)
      }).catch((reason) => {
        console.log(`[Not notified] Message ${message.MessageId}`)
      })
    } else {
      console.log(`[Invalid] SQS message ${message.MessageId} for signal ${signalValidity.decoded_message_body.id} ${signalValidity.reasons}`)
    }
    done()
  },
  sqs: new AWS.SQS()
})

app.on('message_received', (msg) => {
  console.log(`[Received] Message ${msg.MessageId}`);
  app.handleMessage(msg, function (err) {
    if (err) console.log(err);
  })
})

app.on('message_processed', (msg) => {
  console.log(`[Processed] Message ${msg.MessageId}`);
})

app.on('processing_error', (err, signal) => {
  console.log(err.message);
})

app.on('error', (err) => {
  console.log(err.message);
})

signalHelper.init().then(() => app.start())