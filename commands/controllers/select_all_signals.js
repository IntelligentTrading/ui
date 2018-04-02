var api = require('../../core/api')

var moduleBot = null
module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => {
        api.selectAllSignals(msg.chat.id).then(() => {
            bot.sendMessage(msg.chat.id, 'You are now subscribed to all the signals!')
        })
    }
}