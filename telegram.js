const express = require('express');
const app = express();
const fs = require('fs');
const api = require('./core/api')
require('./util/extensions')
var telegram = require('./bot/telegramInstance')
var bot = telegram.bot
var ua = require('universal-analytics')
var botVisitor = ua(process.env.UA_CODE)

var commandsManager = {}
const tickers = require('./data/tickers')

console.log('Loading tickers...')
try {
  tickers.init().then(() => {
    console.log('Tickers cache loaded.')
    console.log('Loading command controllers...')
    var commandFiles = fs.readdirSync('./commands/controllers')
    commandFiles.forEach(cf => {
      var commandClass = require(`./commands/controllers/${cf}`)
      commandsManager[`${cf.replace('.js', '')}`] = new commandClass(bot)
    })
    console.log('Command controllers loaded.')
  }).catch(err => console.log(err))
} catch (err) {
  console.log(err)
}

bot.onText(/\/(\w+)(.*)/, (msg, match) => {
  const chat_id = msg.chat.id;
  botVisitor.set('userId', chat_id)

  var commandText = match[1].replace('/', '');

  var command = commandsManager[commandText]
  if (command)
    try {
      botVisitor.event('Bot Command', commandText, 'Main', (err) => {
        if (err) console.log(err)
      }).send()
      command.cmd(msg, match.map(m => m.trim()).splice(2))
      api.updateUser(chat_id).catch(err => console.log(err))
    }
    catch (err) {
      bot.sendMessage(chat_id, err)
    }
  else
    bot.sendMessage(chat_id, `Sorry, I don't understand command /${commandText}, please check the list of available commands with /help.`)
})

bot.on('callback_query', (callback_message) => {
  botVisitor.set('userId', callback_message.from.id)


  if (callback_message.data.isJSON()) {
    var callback_data = JSON.parse(callback_message.data)

    // so far settings is the only view with a callback
    botVisitor.event('Bot Callback', 'settings', !callback_data.n || callback_data.n == 'Settings' ? 'Main' : callback_data.n, (err) => {
      if (err) console.log(err)
    }).send()

    var commandController = commandsManager[callback_data.cmd]
    if (commandController) {
      commandController.callback(callback_message)
      return
    }
  }
})