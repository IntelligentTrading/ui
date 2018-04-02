const request = require('request');
const express = require('express');
const app = express();
const fs = require('fs');

var api = require('./core/api').api;
require('./util/extensions')

var settingsCmd = require('./commands/settings').settings;

const tickers = require('./commands/data/tickers').tickers;
var commandsList = ['start', 'help', 'settings', 'feedback', 'about', 'price', 'volume',
  'token', 'wizard', 'getMe', 'upgrade', 'verifytx'];

var errorManager = require('./util/error').errorManager;
var sentimentUtil = require('./util/sentiment').sentimentUtil;

var telegram = require('./bot/telegramInstance')
var bot = telegram.bot

var commandsManager = {}

var commandFiles = fs.readdirSync('./commands/controllers')

commandFiles.forEach(cf => {
  var commandClass = require(`./commands/controllers/${cf}`)
  commandsManager[`${cf.replace('.js', '')}`] = new commandClass(bot)
})

console.log('[Telegram bot] initialize data...');
tickers.get()
  .then(() => console.log('[Telegram bot] data initialized.'))
  .catch(reason => {
    console.log('[Telegram bot] data not initialized.')
  })

bot.onText(/\/token(\s*)(.*)/, (msg, match) => {
  const chat_id = msg.chat.id;
  const token = match[2];

  if (token == undefined || token == "") {
    apollo.send('TOKEN', chat_id);
  }
  else {
    settingsCmd.subscribe(chat_id, token)
      .then((result) => {//{ success: true, message: 'Token redeemed correctly!', user: result }

        if (result.success) {
          var subscriptionMessage = result.user.is_ITT_team
            ? settingsCmd.subscribedMessage + '\n(Welcome ITT Member)'
            : settingsCmd.subscribedMessage;

          bot.sendMessage(chat_id, subscriptionMessage, telegram.nopreview_markdown_opts);
        }
        else {
          result.message == "EULA" ? apollo.send('EULA', chat_id) : apollo.send('CUSTOM', chat_id, result.message)
        }
      })
      .catch((reason) => {
        console.log(reason);
        apollo.send('GENERIC', chat_id);
      })
  }
})

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

bot.on('callback_query', (callback_message) => {

  if (callback_message.data.isJSON()) {
    var callback_data = JSON.parse(callback_message.data)
    if (callback_data.cmd == 'wizard') {
      wizardCtrl.callback(callback_message)
      return;
    }
  }

  if (callback_message.data == 'IGNORE')
    return;

  var message_id = callback_message.message.message_id
  var chat_id = callback_message.message.chat.id
  var data_array = callback_message.data.split('.') // eg.: settings_RSK
  var kb_data = data_array[1].split(':')[1]

  var cmd = {
    category: data_array[0],
    operation: {
      action: data_array[1].split(':')[0]
    }
  }

  if (cmd.category == 'hint') {
    if (cmd.operation.action == 'DB') {
      var question_action = kb_data.split('_')[0];
      var question_button = kb_data.split('_')[1];

      if (question_action == 'SIGALL') {

        if (question_button == 'Y') {
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
})

bot.onText(/\/(\w+)(.*)/, (msg, match) => {
  const chat_id = msg.chat.id;
  var commandText = match[1].replace('/', '');

  var command = commandsManager[commandText]
  if (!command) {
    bot.sendMessage(chat_id,`Sorry, I don't understand command /${commandText}, please check the list of available commands with /help.`)
    return
  }

  try {
    command.cmd(msg, match.map(m =>m.trim()).splice(2))
  }
  catch (err) {
    bot.sendMessage(chat_id, err)
  }
})

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

    return bot.sendMessage(chat_id, message, telegram.markdown_opts)
      .catch(reason => console.log(reason));
  }
}