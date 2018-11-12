var _ = require('lodash')
var eventEmitter = require('../../events/botEmitter')
var utils = require('./keyboardUtils')
var keyboardBot = null;

eventEmitter.on('ShowBizKeyboard', (chat_id, message_id, data) => { showKeyboard(chat_id, message_id, data) })
eventEmitter.on('BizKeyboardChanged', (chat_id, message_id, data) => { showKeyboard(chat_id, message_id, data) })

module.exports = function (bot) {
    keyboardBot = bot
}

var showKeyboard = (chat_id, message_id, userSettings) => {
    var keyboardObject = getKeyboardObject(userSettings.horizon)

    keyboardBot.editMessageText(keyboardObject.text, {
        chat_id: chat_id,
        message_id: message_id,
        parse_mode: 'Markdown',
        disable_web_page_preview: "true",
        reply_markup: {
            inline_keyboard: keyboardObject.buttons
        }
    })
}

var getKeyboardObject = (horizon) => {
    return {
        text: getKeyboardText(horizon),
        buttons: getKeyboardButtons(horizon)
    }
}

var getKeyboardText = () => {
    return `*Alerts Reactivated*\nThanks for your interest in our trading alerts. Here’s a 10-day free trial of the Pro plan.`
}

var getKeyboardButtons = () => {

    var btns = [
        [{ text: `Get Free Trial`, url: 'https://intelligenttrading.org' }]
    ]

    return btns
}