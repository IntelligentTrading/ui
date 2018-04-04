var tickers = require('../data/tickers').tickers
var api = require('../../core/api')
var nopreview_markdown_opts = require('../../bot/telegramInstance').nopreview_markdown_opts
var eventEmitter = require('../../events/botEmitter')

var moduleBot = null
module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => {

        const chat_id = msg.chat.id;
        const token = params[0]

        if (token == undefined || token == "") {
            moduleBot.sendMessage(chat_id, tokenError, nopreview_markdown_opts)
            return
        }
        else {
            return api.subscribeUser(chat_id, token).then(userJSON => {
                var responseObj = JSON.parse(userJSON);
                if (responseObj.success) {
                    bot.sendMessage(chat_id, subscribedMessage, nopreview_markdown_opts);
                } else {
                    msg.text = '/start'
                    responseObj.message == "EULA" ? eventEmitter.emit('eula', msg) : moduleBot.sendMessage(chat_id, responseObj.message)
                }
            })
        }
    }
}

var subscribedMessage = "Trading signals will automatically generate. This could take a few minutes. Please hold on. In the meanwhile, you can optimize your preferences by using the command: /settings"
var tokenError = "Your token is invalid or already in use. Please use /token your-token, contact us or [join](https://goo.gl/forms/T7fFe38AM8mNRhDO2) the waiting list."