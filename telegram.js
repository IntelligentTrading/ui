const request = require('request');
const express = require('express');
const app = express();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

var startCmd = require('./commands/start').start;
var helpCmd = require('./commands/help').help;
var priceCmd = require('./commands/price').price;
var volumeCmd = require('./commands/volume').volume;
var feedbackCmd = require('./commands/feedback').feedback;
var settingsCmd = require('./commands/settings').settings;
var qrbuilder = require('./util/qr-builder').builder;

// const aws = require('aws-sdk');

// let s3 = new aws.S3({
//   accessKeyId: process.env.S3_KEY,
//   secretAccessKey: process.env.S3_SECRET
// });

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const telegram_message_options = {
  parse_mode: "Markdown"
};

bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;

  var opts =
    {
      "parse_mode": "Markdown",
      "disable_web_page_preview": "true"
    };

  bot.sendMessage(chatId, startCmd.text, opts);
  settingsCmd.subscribe(chatId)
    .then((result) => {
      bot.sendMessage(chatId, 'You are now subscribed!', opts);
    })
    .catch((reason) => {
      console.log(reason);
      bot.sendMessage(chatId, 'Something went wrong with the subscription, contact us!', opts);
    })
});

bot.onText(/\/help/, (msg, match) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, helpCmd.text());
});

// match with /price, throw away all the blanks, match with any single char
bot.onText(/\/price(\s*)(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const coin = match[2]; // the captured "whatever"

  priceCmd.getPrice(coin)
    .then((result) => {
      bot.sendMessage(chatId, result.toString(), telegram_message_options);
    })
    .catch((reason) => {
      console.log(reason);
      bot.sendMessage(chatId, reason, telegram_message_options);
    });
});

bot.onText(/\/volume(\s*)(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const coin = match[2]; // the captured "whatever"

  volumeCmd.getVolume(coin)
    .then((result) => {
      bot.sendMessage(chatId, result.toString(), telegram_message_options);
    })
    .catch((reason) => {
      console.log(reason);
      bot.sendMessage(chatId, reason);
    });
});

bot.onText(/\/feedback(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const feedback = match[1];

  feedbackCmd.storeFeedback(feedback)
    .then((result) => {
      bot.sendMessage(chatId, result);
    })
    .catch((reason) => {
      console.log(reason);
      bot.sendMessage(chatId, reason);
    });
});

bot.onText(/\/settings/, (msg, match) => {
  const chatId = msg.chat.id;

  settingsCmd.getCurrent(chatId)
    .then(() => {

      var keyboard = settingsCmd.getKeyboard().kb;

      var settingsMessage = keyboard.message;
      var options = {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: keyboard.buttons
        }
      };


      bot.sendMessage(chatId, settingsMessage, options);
    })
    .catch((reason) => {
      console.log(reason);
    });
});

bot.on('callback_query', (callback_message) => {
  //console.log(callback_message);

  var message_id = callback_message.message.message_id;
  var chat_id = callback_message.message.chat.id;

  var data_array = callback_message.data.split('.'); // eg.: settings_RSK
  var cmd = {
    category: data_array[0],
    operation: {
      action: data_array[1].split(':')[0],
      param: data_array[1].split(':')[1]
    }
  };

  if (cmd.category == 'settings') {

    if (cmd.operation.action == 'NAV') {
      var cmd_kb = settingsCmd.getKeyboard(cmd.operation.param);

      bot.editMessageText(cmd_kb.kb.message,
        {
          chat_id: chat_id,
          message_id: message_id,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: cmd_kb.kb.buttons }
        });
    }
    if (cmd.operation.action == 'DB') {
      var cmd_kb = settingsCmd.store(chat_id, cmd.operation.param)
        .then(() => {
          bot.answerCallbackQuery({ callback_query_id: callback_message.id, text: 'Settings saved' })
            .then((any) => {

              var main_kb = settingsCmd.getKeyboard('MAIN').kb;

              bot.editMessageText(main_kb.message,
                {
                  chat_id: chat_id,
                  message_id: message_id,
                  parse_mode: 'Markdown',
                  reply_markup: { parse_mode: 'Markdown', inline_keyboard: main_kb.buttons }
                });
            });
        })
        .catch((reason) => {
          console.log(reason);

          bot.answerCallbackQuery({ callback_query_id: callback_message.id, text: 'Settings not saved' })
            .then(() => {
              bot.sendMessage(chat_id, 'Something went wrong while saving your settings, please try again or contact us if the problem persists.');
            });
        });
    }
  }
  else {
    bot.answerCallbackQuery({ callback_query_id: callback_message.id, text: '' });
  }
});

bot.onText(/\/qr (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const qr_input = match[1];

  var code = qrbuilder.build(qr_input, function (image_name) {
    bot.sendPhoto(chatId, image_name, { caption: qr_input }).then(function () {
      fs.unlinkSync(image_name);
    });
  });
});

bot.onText(/\/getMe/, (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,`Your ID is ${chatId}`);
});


bot.on('message', (msg) => {
  const chatId = msg.chat.id;
});

