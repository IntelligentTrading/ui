const request = require('request');
const express = require('express');
const app = express();
const fs = require('fs');

var startCmd = require('./commands/start').start;
var helpCmd = require('./commands/help').help;
var priceCmd = require('./commands/price').price;
var volumeCmd = require('./commands/volume').volume;
var feedbackCmd = require('./commands/feedback').feedback;
var settingsCmd = require('./commands/settings').settings;
const about = require('./commands/about').about;

const tickers = require('./commands/data/tickers').tickers;
var commandsList = ['start', 'help', 'settings', 'feedback', 'about', 'price', 'volume', 'token'];

var qrbuilder = require('./util/qr-builder').builder;

var errorManager = require('./util/error').errorManager;

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const markdown_opts = {
  parse_mode: "Markdown"
};

console.log('[Telegram bot] initialize data...');
tickers.get()
  .then(() => console.log('[Telegram bot] data initialized.'))
  .catch(reason => {
    console.log('[Telegram bot] data not initialized.')
  });

const nopreview_markdown_opts =
  {
    "parse_mode": "Markdown",
    "disable_web_page_preview": "true"
  };

const nopreview_hmtl_opts =
  {
    "parse_mode": "HTML",
    "disable_web_page_preview": "true"
  };

const MAX_TOKEN_LENGTH = 8;

bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, startCmd.eula_text(chatId), markdown_opts)
    .catch(reason => console.log(reason));
});

bot.onText(/\/token(\s*)(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const token = match[2];

  if (token == undefined || token == "" || token.length > MAX_TOKEN_LENGTH) {
    bot.sendMessage(chatId, settingsCmd.tokenError, nopreview_markdown_opts).catch(reason => {
      errorManager.handleException(reason, errorManager.communication_error_message + reason);
    });
  }
  else {
    settingsCmd.subscribe(chatId, token)
      .then((userSettings) => {
        console.log(userSettings);
        if (userSettings.beta_token_valid == true) {
          var subscriptionMessage = userSettings.is_ITT_team
            ? settingsCmd.subscribedMessage + '\n(Welcome ITT Member)'
            : settingsCmd.subscribedMessage;

          bot.sendMessage(chatId, subscriptionMessage, nopreview_markdown_opts);
        }
        else {
          bot.sendMessage(chatId, settingsCmd.tokenError, nopreview_markdown_opts);
        }
      })
      .catch((reason) => {
        console.log(reason);
        bot.sendMessage(chatId, settingsCmd.subscriptionError, nopreview_markdown_opts);
      })
  }
});

bot.onText(/\/help/, (msg, match) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, helpCmd.text())
    .catch((reason) => {
      console.log(reason);
      bot.sendMessage(chatId, reason);
    });
});

// match with /price, throw away all the blanks, match with any single char
bot.onText(/\/price(\s*)(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const currency = match[2]; // the captured "whatever"

  priceCmd.getPrice(currency)
    .then((result) => {
      bot.sendMessage(chatId, result.toString(), nopreview_markdown_opts)
        .catch((reason) => {
          console.log(reason);
          bot.sendMessage(chatId, errorManager.generic_error_message, markdown_opts);
        });
    })
    .catch((reason) => {
      console.log(reason);
      bot.sendMessage(chatId, errorManager.currency_error, markdown_opts);
    });
});

bot.onText(/\/volume(\s*)(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const currency = match[2]; // the captured "whatever"

  volumeCmd.getVolume(currency)
    .then((result) => {
      bot.sendMessage(chatId, result.toString(), markdown_opts);
    })
    .catch((reason) => {
      console.log(reason);
      bot.sendMessage(chatId, reason);
    });
});

bot.onText(/\/feedback(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username;
  const feedback = match[1];

  if (feedback == undefined || feedback.length <= 0) {
    bot.sendMessage(chatId,
      "Got any comments? We'd love to hear those! You can send us your thoughts by simply typing them behind the /feedback command. For example: /feedback More signals!");
  }
  else {
    feedbackCmd.storeFeedback(chatId, username, feedback)
      .then((result) => {
        bot.sendMessage(chatId, `Thanks! Your feedback has been sent to the team and will be reviewed shortly. (Feedback code: ${result.body.shortLink})`);
      })
      .catch((reason) => {
        console.log(reason);
        bot.sendMessage(chatId, reason);
      });
  }
});

bot.onText(/\/about(.*)/, (msg, match) => {
  const chatId = msg.chat.id;

  about.get()
    .then((result) => {
      bot.sendMessage(chatId, result, nopreview_hmtl_opts);
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

      // getCurrent sets the user settings and the keyboard message and buttons callback_data values,
      // but it's an hidden dependency, maybe I should redesign the flow
      var keyboard = settingsCmd.getKeyboard();

      keyboard.getButtons().then((btns) => {
        var settingsMessage = keyboard.message;
        var options = {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: btns
          }
        };

        bot.sendMessage(chatId, settingsMessage, options);
      });
    })
    .catch((reason) => {
      console.log(reason);
    });
});

bot.on('callback_query', (callback_message) => {

  var message_id = callback_message.message.message_id;
  var chat_id = callback_message.message.chat.id;

  var data_array = callback_message.data.split('.'); // eg.: settings_RSK
  var kb_data = data_array[1].split(':')[1];

  var cmd = {
    category: data_array[0],
    operation: {
      action: data_array[1].split(':')[0]
    }
  };

  if (cmd.category == 'registration') {
    if (cmd.operation.action == 'DB') {
      settingsCmd.store(chat_id, kb_data)
        .then(() => {
          bot.answerCallbackQuery({ callback_query_id: callback_message.id, text: 'Settings saved' })
            .then(() => {
              bot.sendMessage(chat_id, startCmd.text);
            })
            .catch(reason => {
              console.log(reason);
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
  if (cmd.category == 'settings') {

    if (cmd.operation.action == 'CLOSE') {
      bot.deleteMessage(chat_id, message_id).catch(reason => console.log(reason));
    }
    else if (cmd.operation.action == 'NAV') {

      cmd.operation.kb_label = kb_data.split('_')[0];
      cmd.operation.kb_page = kb_data.split('_')[1]

      var cmd_kb = settingsCmd.getKeyboard(cmd.operation.kb_label);

      cmd_kb.getButtons(cmd.operation.kb_page).then((btns) => {

        bot.editMessageText(cmd_kb.message,
          {
            chat_id: chat_id,
            message_id: message_id,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: btns }
          });
      });
    }
    if (cmd.operation.action == 'DB') {
      settingsCmd.store(chat_id, kb_data)
        .then(() => {
          bot.answerCallbackQuery({ callback_query_id: callback_message.id, text: 'Settings saved' })
            .then((any) => {

              //var main_kb = settingsCmd.getKeyboard('MAIN');

              var current_kb = settingsCmd.getCurrentKeyboard();
              current_kb.getButtons().then(btns => {
                bot.editMessageText(current_kb.message, {
                  chat_id: chat_id,
                  message_id: message_id,
                  parse_mode: 'Markdown',
                  reply_markup: { parse_mode: 'Markdown', inline_keyboard: btns }
                }).catch(reason => {
                  console.log(reason);
                });
              })
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
  const userId = msg.from.id;
  const username = msg.from.username;

  bot.sendMessage(chatId, `Your ChatId is ${chatId}, userId ${userId} and username ${username}`);
});

bot.onText(/(^\/{1})[a-z]+/, (msg, match) => {
  const chatId = msg.chat.id;
  var command = match[0].replace('/', '');
  if (commandsList.indexOf(command) < 0)
    bot.sendMessage(chatId, `Sorry, I don't understand command /${command}, please check the list of available commands with /help.`);
});

