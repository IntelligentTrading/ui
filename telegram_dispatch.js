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

console.log('Starting telegram dispatching service');

function notify(message_data) {

  var opts =
    {
      "parse_mode": "Markdown",
      "disable_web_page_preview": "true"
    };

  if (message_data != undefined) {
    var risk = message_data.risk;
    var horizon = message_data.horizon;

    var telegram_signal_message = signalHelper.parse(message_data);

    if (telegram_signal_message != undefined) {

      var risk_filter = risk && risk != '' && risk != 'None' ? `risk=${risk}` : '';
      var horizon_filter = horizon && horizon != '' && horizon != 'None' ? `horizon=${horizon}` : '';
      var filters = [risk_filter, horizon_filter].join('&');

      if (filters.lastIndexOf('&') == filters.length - 1 || filters.indexOf('&') == 0)
        filters.replace('&', '');

      request(`https://${process.env.ITT_API_HOST}/users?${filters}`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body)

          if (process.env.LOCAL_ENV == undefined) {
            data.chat_ids.forEach((chat_id) => {
              if (chat_id != undefined) {
                bot.sendMessage(chat_id, telegram_signal_message, opts)
                  .then(() => { return true })
                  .catch((err) => {
                    console.log(`${err.message} :: chat ${chat_id}`);
                    return false;
                  });
              }
            });
          }
          else {
            bot.sendMessage(process.env.TELEGRAM_TEST_CHAT_ID, telegram_signal_message, opts)
              .then(() => { return true })
              .catch((err) => {
                console.log(err.message);
                return false;
              });
          }
        }
        else {
          console.log(error);
        }
      });
    }
  }
}

var aws_queue_url = process.env.LOCAL_ENV
  ? `${process.env.AWS_SQS_LOCAL_QUEUE_URL}`
  : `${process.env.AWS_SQS_QUEUE_URL}`;

const app = Consumer.create({
  queueUrl: aws_queue_url,
  handleMessage: (message, done) => {

    var decoded_message_body = signalHelper.decodeMessage(message.Body);
    var hasValidTimestamp = signalHelper.hasValidTimestamp(decoded_message_body);
    var isDuplicateMessage = signalHelper.isDuplicateMessage(message);

    if (hasValidTimestamp && !isDuplicateMessage) {
      if (notify(decoded_message_body))
        console.log(`[Notified] Message ${message.MessageId}`);
      else
        console.log(`[Unotified] Message ${message.MessageId}`);
    }
    else {
      var invalidReason = !hasValidTimestamp ? 'is too old' : 'is a duplicate';
      console.log(`[Invalid] Message ${message.MessageId} ${invalidReason}`);
    }
    done();
  },
  sqs: new AWS.SQS()
});

app.on('message_received', (msg) => {

  console.log(`[Received] Message ${msg.MessageId}`);

  app.handleMessage(msg, function (err) {
    if (err) console.log(err);
  })
});

app.on('message_processed', (msg) => {
  console.log(`[Processed] Message ${msg.MessageId}`);
});

app.on('processing_error', (err, signal) => {
  console.log(err.message);
});

app.on('error', (err) => {
  console.log(err.message);
});

app.start();
