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

    console.log(`${message_data.signal} signal`);

    /*if (horizon == 'short') { //! For the BETA we just skip the short horizon signals
      return new Promise((resolve, reject) => {
        reject('Short horizon signals are skipped in BETA');
      });
    }*/

    return signalHelper.parse(message_data)
      .then(telegram_signal_message => {
        if (telegram_signal_message != undefined) {

          var horizons = ['short','medium','long']

          /*var risk_filter = risk && risk != '' && risk != 'None' ? `risk=${risk}` : '';
          var horizon_filter = horizon && horizon != '' && horizon != 'None' ? `horizon=${horizon}` : '';
          var beta_users_filter = 'beta_token_valid=true';

          //! BETA - no filters on risk and horizon, just skip the short horizon signals and
          //! deliver everything to the beta users
          //TODO var filters = [risk_filter, horizon_filter,beta_users_filter].join('&');

          var filters = [beta_users_filter];

          if (filters.lastIndexOf('&') == filters.length - 1 || filters.indexOf('&') == 0)
            filters.replace('&', '');*/

          return api.usersHorizons()
            .then(users => {

              var filtered_users = users.filter(u => users.indexOf(u) >= horizons.indexOf(horizon));

              if (process.env.LOCAL_ENV == undefined) {
                filtered_users.forEach((chat_id) => {
                  if (chat_id != undefined) {
                    bot.sendMessage(chat_id, telegram_signal_message, opts)
                      .catch((err) => {
                        var errMessage = `${err.message} :: chat ${chat_id}`;
                        console.log(errMessage);
                      });
                  }
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
/*return api.users(filters)
  .then(function (response) {
    if (response.statusCode == 200) {
      var data = JSON.parse(response.body)

      if (process.env.LOCAL_ENV == undefined) {
        data.chat_ids.forEach((chat_id) => {
          if (chat_id != undefined) {
            bot.sendMessage(chat_id, telegram_signal_message, opts)
              .catch((err) => {
                var errMessage = `${err.message} :: chat ${chat_id}`;
                console.log(errMessage);
              });
          }
        });
      }
      else {
        bot.sendMessage(process.env.TELEGRAM_TEST_CHAT_ID, telegram_signal_message, opts)
          .catch((err) => {
            console.log(err.message)
          });
      }
    }
    else {
      console.log(error);
    }
  })
  .catch((reason) => {
    console.log(reason);
  });*/



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

