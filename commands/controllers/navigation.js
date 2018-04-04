var eventEmitter = require('../../events/botEmitter')
var moduleBot = null
const fs = require('fs')
const api = require('../../core/api')

var keyboards = {}
eventEmitter.on('closeKeyboard', (chat_id, message_id) => closeKeyboard(chat_id, message_id))

module.exports = function (bot) {
    moduleBot = bot
    loadKeyboards(moduleBot)

    this.cmd = (msg, params) => {
        const chat_id = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username;
    }

    this.callback = (callback_message) => {
        var callback_data = JSON.parse(callback_message.data)
        if (callback_data.f)
            this[callback_data.f](callback_message)
        else if (callback_data.n) {
            var message_id = callback_message.message.message_id
            var chat_id = callback_message.message.chat.id
            eventEmitter.emit(`Show${callback_data.n}Keyboard`, chat_id, message_id, callback_data.data)
        }
    }

    this.close = (callback_message) => {
        var message_id = callback_message.message.message_id
        var chat_id = callback_message.message.chat.id
        closeKeyboard(chat_id, message_id)
    }

    this.back = (callback_message) => {
        var message_id = callback_message.message.message_id
        var chat_id = callback_message.message.chat.id
        var callback_data = JSON.parse(callback_message.data)
        if (!callback_data.data) {
            api.users({ telegram_chat_id: chat_id }).then((userJSON) => {
                var user = JSON.parse(userJSON)
                eventEmitter.emit(`${callback_data.n}KeyboardChanged`, chat_id, message_id, user.settings)
            })
        }
    }
}

function closeKeyboard(chat_id, message_id) {
    return moduleBot.deleteMessage(chat_id, message_id)
}

function loadKeyboards(bot) {
    var keyboardFiles = fs.readdirSync('./commands/keyboards').filter(kf => kf.endsWith('Keyboard.js'))
    keyboardFiles.forEach(kf => {
        require(`../keyboards/${kf.replace('.js', '')}`)(bot)
    })
}