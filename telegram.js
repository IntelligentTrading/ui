const request = require('request');
const express = require('express');
const app = express();
const fs = require('fs');

var api = require('./core/api').api;

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
var sentimentUtil = require('./util/sentiment').sentimentUtil;

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const timezone = require('geo-tz');

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

bot.onText(/\/start/, (msg, match) => {
  const chat_id = msg.chat.id;
  apollo.send('EULA', chat_id);
});

bot.onText(/\/token(\s*)(.*)/, (msg, match) => {
  const chat_id = msg.chat.id;
  const token = match[2];

  if (token == undefined || token == "") {
    apollo.send('TOKEN', chat_id);
  }
  else {
    settingsCmd.subscribe(chat_id, token)
      .then((userSettings) => {
        console.log(userSettings);
        if (userSettings && !userSettings.err) {
          var subscriptionMessage = userSettings.is_ITT_team
            ? settingsCmd.subscribedMessage + '\n(Welcome ITT Member)'
            : settingsCmd.subscribedMessage;

          bot.sendMessage(chat_id, subscriptionMessage, nopreview_markdown_opts);
        }
        else {
          userSettings.err == "EULA" ? apollo.send('EULA', chat_id) : apollo.send('CUSTOM', chat_id, userSettings.err)
        }
      })
      .catch((reason) => {
        console.log(reason);
        apollo.send('GENERIC', chat_id);
      })
  }
});

bot.onText(/\/help/, (msg, match) => {
  const chat_id = msg.chat.id;
  bot.sendMessage(chat_id, helpCmd.text())
});

// match with /price, throw away all the blanks, match with any single char
bot.onText(/\/price(\s*)(.*)/, (msg, match) => {
  const chat_id = msg.chat.id;
  const currency = match[2]; // the captured "whatever"

  if (!currency) {
    apollo.send('PRICE', chat_id);
  }
  else {
    priceCmd.getPrice(currency)
      .then((result) => {
        bot.sendMessage(chat_id, result.toString(), nopreview_markdown_opts)
      })
      .catch(reason => {
        console.log(reason);
        apollo.send('PRICE', chat_id);
      })
  }
});

bot.onText(/\/volume(\s*)(.*)/, (msg, match) => {
  const chat_id = msg.chat.id;
  const currency = match[2]; // the captured "whatever"

  volumeCmd.getVolume(currency)
    .then((result) => {
      bot.sendMessage(chat_id, result.toString(), markdown_opts);
    })
    .catch((reason) => {
      console.log(reason);
      bot.sendMessage(chat_id, reason);
    });
});

bot.onText(/\/feedback(.*)/, (msg, match) => {
  const chat_id = msg.chat.id;
  const username = msg.chat.username;
  const feedback = match[1];

  if (feedback == undefined || feedback.length <= 0) {
    bot.sendMessage(chat_id, feedbackCmd.helpText);
  }
  else {
    feedbackCmd.storeFeedback(chat_id, username, feedback)
      .then((result) => {
        bot.sendMessage(chat_id, feedbackCmd.thanksText(result.body.shortLink));
      })
      .catch((reason) => {
        console.log(reason);
        apollo.send('CUSTOM', chat_id, reason);
      });
  }
});

bot.onText(/\/about(.*)/, (msg, match) => {
  const chat_id = msg.chat.id;

  about.get()
    .then((result) => {
      bot.sendMessage(chat_id, result, nopreview_hmtl_opts);
    })
    .catch((reason) => {
      console.log(reason);
      apollo.send('CUSTOM', chat_id, reason);
    });
});

bot.onText(/\/settings/, (msg, match) => {
  const chat_id = msg.chat.id;

  settingsCmd.getUser(chat_id)
    .then((user) => {

      if (user.eula) {
        var keyboard = settingsCmd.getKeyboard();

        keyboard.getButtons(0).then((btns) => {
          var settingsMessage = keyboard.message;
          var options = {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: btns
            }
          };

          bot.sendMessage(chat_id, settingsMessage, options);
        });
      }
      else {
        apollo.send('EULA', chat_id);
      }
    })
    .catch((reason) => {
      console.log(reason);
      apollo.send('GENERIC', chat_id);
    });
});

bot.onText(/\/select_all_signals/, (msg, match) => {
  settingsCmd.selectAllSignals(msg.chat.id)
    .then(() => {
      bot.sendMessage(msg.chat.id, 'You are now subscribed to all the signals!')
        .catch((reason) => console.log(reason))
    })
    .catch(() => {
      apollo.send('SETTINGS', chat_id);
    })
});

bot.onText(/\/keygen(\s*)(.*)/, (msg, match) => {
  const chat_id = msg.chat.id;
  var admin_token = match[2].split(' ')[0];
  var plan = match[2].split(' ')[1];

  settingsCmd.generateCodeForPlan(plan, admin_token)
    .then(result => {
      var license = JSON.parse(result)
      bot.sendMessage(chat_id, license.code, markdown_opts)
    })
    .catch(reason => {
      console.log(reason)
      apollo.send('AUTH', chat_id);
    })
});

bot.on('callback_query', (callback_message) => {

  var message_id = callback_message.message.message_id;
  var chat_id = callback_message.message.chat.id;

  if (callback_message.data == 'IGNORE')
    return;

  var data_array = callback_message.data.split('.'); // eg.: settings_RSK
  var kb_data = data_array[1].split(':')[1];

  var cmd = {
    category: data_array[0],
    operation: {
      action: data_array[1].split(':')[0]
    }
  };

  if (cmd.category == 'hint') {
    if (cmd.operation.action == 'DB') {
      var hint_action = kb_data.split('_')[0];
      var hint_button = kb_data.split('_')[1];

      if (hint_action == 'SIGALL') {

        if (hint_button == 'Y') {
          settingsCmd.selectAllSignals(chat_id)
            .then(() => {
              bot.sendMessage(chat_id, 'You are now subscribed to all the signals!')
                .catch((reason) => console.log(reason))
            })
            .catch(() => {
              apollo.send('SETTINGS', chat_id);
            })
        } else {
          bot.sendMessage(chat_id, 'You can always select your currencies of interest with the /settings command!')
            .catch((reason) => console.log(reason))
        }
      }
    }
  }

  if (cmd.category == 'panic') { //panic.DB:BULL_${feed.id}`
    if (cmd.operation.action == 'DB') {
      var reaction = kb_data.split('_')[0];
      var feedId = kb_data.split('_')[1];

      api.addFeedReaction(feedId, reaction, chat_id)
        .then(updatedFeed => {
          var updatedText = sentimentUtil.messageTemplate(updatedFeed, callback_message.message);
          bot.answerCallbackQuery({ callback_query_id: callback_message.id, text: 'Reaction saved!' })
            .then(res => {
              bot.editMessageText(updatedText,
                {
                  chat_id: chat_id,
                  message_id: message_id,
                  parse_mode: 'Markdown',
                  disable_web_page_preview: true
                });
            })
        })
        .catch(err => {
          console.log(err)
          bot.answerCallbackQuery({ callback_query_id: callback_message.id, text: 'Reaction timespan expired!' })
        })
    }
  }
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
              apollo.send('SETTINGS', chat_id);
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
      cmd.operation.kb_page = kb_data.split('_')[1] ? kb_data.split('_')[1] : "0";

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
              apollo.send('SETTINGS', chat_id);
            });
        });
    }
  }
  else {
    bot.answerCallbackQuery({ callback_query_id: callback_message.id, text: '' });
  }
});

bot.onText(/\/qr (.+)/, (msg, match) => {
  const chat_id = msg.chat.id;
  const qr_input = match[1];

  var code = qrbuilder.build(qr_input, function (image_name) {
    bot.sendPhoto(chat_id, image_name, { caption: qr_input }).then(function () {
      fs.unlinkSync(image_name);
    });
  });
});

bot.onText(/\/getMe/, (msg, match) => {
  const chat_id = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;

  bot.sendMessage(chat_id, `Your chat_id is ${chat_id}, userId ${userId} and username ${username}`);
});

bot.on('message', (msg) => {
  if (msg.location) {
    // Auto-adjust UTC
    var tz = timezone.tzMoment(msg.location.latitude, msg.location.longitude)
    settingsCmd.setTimezone(msg.chat.id, tz._z.name, tz._z.abbrs[1])
      .then(result => {
        bot.sendMessage(msg.chat.id, `Your timezone is now updated to *${tz._z.name}*`, markdown_opts)
      })
      .catch(reason => {
        apollo.send('GENERIC', chat_id);
        console.log(reason)
      })
  }
});

bot.onText(/(^\/{1})[a-z]+/, (msg, match) => {
  const chat_id = msg.chat.id;
  var command = match[0].replace('/', '');
  if (commandsList.indexOf(command) < 0)
    bot.sendMessage(chat_id, `Sorry, I don't understand command /${command}, please check the list of available commands with /help.`);
});

var apollo = {
  send: (category, chat_id, custom_message = "") => {

    var message = "";

    if (category == "EULA") {
      message = startCmd.eula_text(chat_id);
    }
    else if (category == "GENERIC") {
      message = errorManager.generic_error_message;
    }
    else if (category == "SETTINGS") {
      message = errorManager.settings_error;
    }
    else if (category == "COMMUNICATION") {
      message = communication_error_message
    }
    else if (category == "TOKEN") {
      message = settingsCmd.tokenError
    }
    else if (category == "CUSTOM") {
      message = custom_message
    }
    else if (category == "PRICE") {
      message = "Write `/price <ticker>` to get the latest price.\nFor example: /price ETH";
    }
    else if (category == "AUTH") {
      message = 'You are not authorized to perform this operation.'
    }

    return bot.sendMessage(chat_id, message, markdown_opts)
      .catch(reason => console.log(reason));
  }
}