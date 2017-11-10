require('./util/extensions');
var _ = require('lodash');
const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');
var signalHelper = require('./commands/signal_helper').signalHelper;

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });
const telegram_message_options = {
  parse_mode: "Markdown"
};

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET
});

function notify(message_data) {

  var opts =
  {
    "parse_mode": "Markdown",
    "disable_web_page_preview": "true"
  };

  if (message_data != undefined) {
    var risk = message_data.risk;

    console.log('Getting SQS signals');
    var telegram_signal_message = signalHelper.parse(message_data);

    if (telegram_signal_message != undefined) {
      //! Re-add ?risk=${risk}
      request(`https://${process.env.ITT_API_HOST}/users`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body)

          if (process.env.LOCAL_ENV == undefined) {
            data.chat_ids.forEach((chat_id) => {
              if (chat_id != undefined) {
                bot.sendMessage(chat_id, telegram_signal_message,opts).catch((err) => {
                  console.log(err);
                });
              }
            });
          }
          else {
            bot.sendMessage(process.env.TELEGRAM_TEST_CHAT_ID, telegram_signal_message, opts).catch((err) => {
              console.log(err);
            });
          }
        }
      });
    }
  }
}

//
var aws_queue_url = process.env.LOCAL_ENV == undefined
  ? `${process.env.AWS_SQS_QUEUE_URL}`
  : `${process.env.AWS_SQS_LOCAL_QUEUE_URL}`;

const app = Consumer.create({
  queueUrl: aws_queue_url,
  handleMessage: (message, done) => {

    var decoded_message_body = signalHelper.decodeMessage(message.Body);
    if (signalHelper.hasValidTimestamp(decoded_message_body) && !signalHelper.isDuplicateMessage(message)) {
      notify(decoded_message_body);
    }
    else {
      console.log('Invalid message ' + message.MessageId)
    }
    done();
  },
  sqs: new AWS.SQS()
});

app.on('message_received', (msg) => {

  app.handleMessage(msg, function (err) {
    if (err) console.log(err);
    else console.log(`Sent ${msg.MessageId}`)
  })
});

app.on('message_processed', (msg) => {
  console.log(`Processed ${msg.MessageId}`);
});

app.on('processing_error', (err, signal) => {
  console.log(err.message);
});

app.on('error', (err) => {
  console.log(err.message);
});

app.start();
