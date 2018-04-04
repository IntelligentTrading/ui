const request = require('request');
const express = require('express');
const app = express();
const fs = require('fs');
const api = require('./core/api')
require('./util/extensions')

const tickers = require('./commands/data/tickers').tickers;
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
tickers.get().then(() => console.log('[Telegram bot] data initialized.'))
  .catch(reason => {
    console.log('[Telegram bot] data not initialized.')
  })

bot.onText(/\/(\w+)(.*)/, (msg, match) => {
  const chat_id = msg.chat.id;
  var commandText = match[1].replace('/', '');

  var command = commandsManager[commandText]
  if (command)
    try {
      command.cmd(msg, match.map(m => m.trim()).splice(2))
    }
    catch (err) {
      bot.sendMessage(chat_id, err)
    }
  else
    bot.sendMessage(chat_id, `Sorry, I don't understand command /${commandText}, please check the list of available commands with /help.`)
})

bot.on('callback_query', (callback_message) => {

  if (callback_message.data.isJSON()) {
    var callback_data = JSON.parse(callback_message.data)

    var commandController = commandsManager[callback_data.cmd]
    if (commandController) {
      commandController.callback(callback_message)
      return
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
})