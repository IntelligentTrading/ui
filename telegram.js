const request = require('request');
const express = require('express');
const app = express();
const fs = require('fs');
const api = require('./core/api')
require('./util/extensions')

var telegram = require('./bot/telegramInstance')
var bot = telegram.bot

var commandsManager = {}
var commandFiles = fs.readdirSync('./commands/controllers')
commandFiles.forEach(cf => {
  var commandClass = require(`./commands/controllers/${cf}`)
  commandsManager[`${cf.replace('.js', '')}`] = new commandClass(bot)
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
})