var errorManager = require('./util/error.js').errorManager;
require('./util/extensions');
var _ = require('lodash');
const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');
var signalHelper = require('./commands/signal_helper').signalHelper;
var api = require('./core/api').api;
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
    var signal_counter_currency

    console.log(`${message_data.signal} signal`);

    return signalHelper.parse(message_data)
      .then(telegram_signal_message => {
        if (telegram_signal_message != undefined) {

          var filters = ['is_subscribed=true','beta_token_valid=true',
            buildHorizonFilter(horizon),
            `transaction_currencies=${message_data.transaction_currency}`,
            `counter_currencies=${message_data.counter_currency}`];

          return api.users({ filters: filters }).then(full_response => {

            if (full_response.statusCode != 200) {
              console.log(full_response.statusMessage);
              throw new Error(errorManager.generic_error_message);
            }

            var users = JSON.parse(full_response.body);
            if (process.env.LOCAL_ENV == undefined) {
              users.forEach(user => {

                bot.sendMessage(user.chat_id, telegram_signal_message, opts)
                  .catch(err => {
                    var errMessage = `${err.message} :: chat ${user.chat_id}`;
                    console.log(errMessage);
                  });
              });
            }
            else {
              bot.sendMessage(process.env.TELEGRAM_TEST_CHAT_ID, telegram_signal_message, opts)
                .catch((err) => {
                  console.log(err.message)
                });
            }
          })
            .catch(reason => {
              console.log(reason)
            })
        }
      });
  }
}

var buildHorizonFilter = (horizon) => {
  var horizons = ['long', 'medium', 'short']
  return `horizon=${horizons.slice(horizons.indexOf(horizon)).join(',')}`;
}

var aws_queue_url = process.env.LOCAL_ENV
  ? `${process.env.AWS_SQS_LOCAL_QUEUE_URL}`
  : `${process.env.AWS_SQS_QUEUE_URL}`;

const app = Consumer.create({
  queueUrl: aws_queue_url,
  handleMessage: (message, done) => {

    var decoded_message_body = signalHelper.decodeMessage(message.Body);
    var hasValidTimestamp = signalHelper.hasValidTimestamp(decoded_message_body);
    var isCounterCurrency = signalHelper.isCounterCurrency(decoded_message_body);
    var isDuplicateMessage = signalHelper.isDuplicateMessage(message);

    if (hasValidTimestamp && !isDuplicateMessage && !isCounterCurrency) {
      notify(decoded_message_body)
        .then((msg) => {
          console.log(`[Notified] Message ${message.MessageId}`);
        })
        .catch((reason) => {
          console.log(`[Not notified] Message ${message.MessageId}`);
          console.log(reason);
        })
    }
    else {

      var invalidReasonsList = [];
      if (!hasValidTimestamp)
        invalidReasonsList.push('is too old');
      if (isDuplicateMessage)
        invalidReasonsList.push('is a duplicate');
      if (isCounterCurrency)
        invalidReasonsList.push('is counter currency');

      var reasons = invalidReasonsList.join(',');

      console.log(`[Invalid] Message ${message.MessageId} ${reasons}`);
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

