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

bot.onText(/ITF/, (msg, match) => {
  return api.referral(msg.chat.id, msg.text)
    .then(result => bot.sendMessage(msg.chat.id, result))
    .catch(error => {
      bot.sendMessage(msg.chat.id, error.error)
    })
})

bot.onText(/0x/, (msg, match) => {
  // it's an address!
  if (msg.text.length == 42) {
    return api.addStakeHolderWalletAddress(msg.chat.id, msg.text).then(messageToSign => {
      bot.sendMessage(msg.chat.id, `Your stakeholder wallet address has been added.\nIn order to verify the ownership, please [sign](https://mycrypto.com/sign-and-verify-message/sign) from the same address the message *${messageToSign}* and paste the signature hash below.`, telegram.nopreview_markdown_opts)
    })
  }
  // it's a signature!
  else if (msg.text.length == 132) {
    return api.verifySignature(msg.chat.id, msg.text).then(verificationResult => {
      if (verificationResult.verified) {
        return bot.sendMessage(msg.chat.id, 'Yay! Your signature is verified! Give us a moment to verify your stake!').then(() => {
          return api.checkStakeholdersStatus(msg.chat.id).then(stakeholder => {
            var stakeMessage = 'Stake 10K or 100K ITT tokens in order to get the *Stake Holder* status!'
            if (stakeholder.settings.staking.diecimila || stakeholder.settings.staking.diecimila) {
              stakeMessage = 'You are a stake holder!\nPlease remember that reductions in the stake may result in the loss of the current status.'
            }
            bot.sendMessage(msg.chat.id, stakeMessage, telegram.nopreview_markdown_opts)
          })
        })
      }
      else {
        bot.sendMessage(msg.chat.id, `Your signature is invalid! Please check the spelling, copy paste the full hash or for contact us in case nothing works.`)
      }
    })
  }
  else {
    bot.sendMessage(msg.chat.id, 'Are you trying to paste your address or verify a signature? Check the spelling and the text length.')
  }
})