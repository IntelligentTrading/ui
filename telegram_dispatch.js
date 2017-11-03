require('./util/extensions');
const request = require('request');
const express = require('express');
const app = express();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const sqs = require('sqs');

const queue = sqs({
  access: process.env.AWS_KEY,
  secret: process.env.AWS_SECRET,
  region: 'us-east-1' // defaults to us-east-1
});
const production_queue_name = process.env.SQS_PROD;

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });
const telegram_message_options = {
  parse_mode: "Markdown"
};

function onSQSMessage(message_data, callback) {
  if (message_data.type == "trade signal") {
    var risk = message_data.risk;


    console.log('Getting data from the SQS');
    var telegram_signal_message = parse_signal(message_data);

    if (telegram_signal_message != undefined) {
      request(`https://${process.env.ITT_API_HOST}/users?risk=${risk}`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body)
          data.chat_ids.forEach((chat_id) => {
            if (chat_id != undefined) {
              //TODO bot.sendMessage(chat_id, telegram_signal_message);
            }
          });
          //! TEST
          bot.sendMessage(process.env.TELEGRAM_TEST_CHAT_ID, telegram_signal_message);
        }
      });
    }
  }
  callback(); // we are done with this message - pull a new one
  // calling the callback will also delete the message from the queue
}

function parse_signal(message_data) {
  try {

    var telegram_signal_message = undefined;

    if (message_data.signal == 'SMA') {

      var trend_sentiment = `${(message_data.trend == -1 ? 'Bearish' : 'Bullish')}`;
      var trend_strength = `${(message_data.trend == -1 ? '🔴' : '🔵').repeat(message_data.strength)}${'⚪️'.repeat(message_data.strength_max - message_data.strength)}`;

      telegram_signal_message = `${message_data.coin}/USD\n${trend_sentiment} ${trend_strength}\n${message_data.horizon.toSentenceCase()} horizon (Poloniex)\nPrice: $${message_data.price} (${message_data.price_change > 0 ? '+' : '-'}${message_data.price_change * 100}%)`;
    }
    //TODO END
  }
  catch (err) {
    console.log(err);
  }

  return telegram_signal_message;
}

queue.pull(production_queue_name, [workers = 1], onSQSMessage)
