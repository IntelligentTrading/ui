require('./util/extensions');
const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');

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

function parse_signal(message_data) {
  try {

    var telegram_signal_message = undefined;

    if (message_data.signal == 'SMA' || message_data.signal == 'EMA') {

      var trend_sentiment = `${(message_data.trend == -1 ? 'Bearish' : 'Bullish')}`;
      var trend_strength = `${(message_data.trend == -1 ? '🔴' : '🔵').repeat(message_data.strength_value)}${'⚪️'.repeat(message_data.strength_max - message_data.strength_value)}`;
      
      var price_text = message_data.price == undefined ? "" : `Price: ${message_data.price} (${message_data.price_change > 0 ? '+' : '-'}${message_data.price_change * 100}%)`
      telegram_signal_message = `${message_data.coin}/USD\n${trend_sentiment} ${trend_strength}\n${message_data.horizon.toSentenceCase()} horizon (Poloniex)\n`+price_text;
    }
  }
  catch (err) {
    console.log(err);
  }

  return telegram_signal_message;
}

function notify(message) {
  var message_data_64 = message.Body;
  var message_data;
  try {
    var message_data_string = Buffer.from(message_data_64, 'base64').toString();
    message_data = JSON.parse(message_data_string);
  }
  catch (err) {
    console.log(err);
    return;
  }

  if (message_data != undefined) {
    var risk = message_data.risk;

    console.log('Getting SQS signals');
    var telegram_signal_message = parse_signal(message_data);

    if (telegram_signal_message != undefined) {
      //! Re-add ?risk=${risk}
      request(`https://${process.env.ITT_API_HOST}/users`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body)
          data.chat_ids.forEach((chat_id) => {
            if (chat_id != undefined) {
              bot.sendMessage(chat_id, telegram_signal_message);
            }
          });
        }
      });
    }
  }
}

//
var aws_queue_url = `${process.env.AWS_SQS_QUEUE_URL}`;

const app = Consumer.create({
  queueUrl: aws_queue_url,
  handleMessage: (message, done) => {
    notify(message);
    done();
  },
  sqs: new AWS.SQS()
});

app.on('message_received', (msg) => {

  app.handleMessage(msg, function (err) {
    if (err) console.log(err);
    else console.log(msg)
  })
});

app.on('error', (err) => {
  console.log(err.message);
});

app.start();