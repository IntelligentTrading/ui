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

    this.callback = async (callback_message) => {
        var callback_data = JSON.parse(callback_message.data)
        if (callback_data.f)
            this[callback_data.f](callback_message)
        else if (callback_data.n) {
            //Cur(0) -> Keyboard(page)
            var navigateToKeyboard = callback_data.n.split('(')[0]
            var navigateToPage = callback_data.n.split('(')[1]
            if (navigateToPage) navigateToPage = navigateToPage.replace(')', '')

            var message_id = callback_message.message.message_id
            var chat_id = callback_message.message.chat.id
            var userSettings = callback_data.d
            if (!userSettings) {
                userSettings = await loadUserSettings(chat_id)
            }
            eventEmitter.emit(`Show${navigateToKeyboard}Keyboard`, chat_id, message_id, userSettings, navigateToPage)
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
        loadUserSettings(chat_id).then(userSettings => {
            eventEmitter.emit(`${callback_data.n}KeyboardChanged`, chat_id, message_id, userSettings)
        })
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

async function loadUserSettings(chat_id) {
    var userJSON = await api.users({ telegram_chat_id: chat_id })
    return JSON.parse(userJSON).settings
}