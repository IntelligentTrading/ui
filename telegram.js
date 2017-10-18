const request = require('request');
const express = require('express');
const app = express();
const TelegramBot = require('node-telegram-bot-api');


// const aws = require('aws-sdk');

// let s3 = new aws.S3({
//   accessKeyId: process.env.S3_KEY,
//   secretAccessKey: process.env.S3_SECRET
// });


// START TelegramBot

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;
const api_host_url = process.env.ITT_API_HOST;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/price (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const coin = match[1]; // the captured "whatever"

  var resp = ""

  request(api_host_url+'/price?coin='+coin, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body)
        if ('price' in info){
          bot.sendMessage(chatId, (parseFloat(info['price']/100000000)).toString() + " BTC")
        } else {
          bot.sendMessage(chatId, "coin not found")
        }
      }
  })

  // send back the matched "whatever" to the chat

});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});
