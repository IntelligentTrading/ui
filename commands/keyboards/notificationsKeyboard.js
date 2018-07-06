var _ = require('lodash')
var dateHelper = require('../../util/dates')
var eventEmitter = require('../../events/botEmitter')
var utils = require('./keyboardUtils')
var keyboardBot = null;

eventEmitter.on('ShowNotKeyboard', (chat_id, message_id, data) => { showKeyboard(chat_id, message_id, data) })
eventEmitter.on('NotKeyboardChanged', (chat_id, message_id, data) => { showKeyboard(chat_id, message_id, data) })

module.exports = function (bot) {
    keyboardBot = bot
}

var showKeyboard = (chat_id, message_id, userSettings) => {
    var keyboardObject = getKeyboardObject(userSettings.indicators)

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

var getKeyboardObject = (indicators) => {
    return {
        text: getKeyboardText(),
        buttons: getKeyboardButtons(indicators)
    }
}

var getKeyboardText = () => {
    return 'Notifications Settings\n\nManage signals one by one in order to receive what suits your trading style more.'

}

var getKeyboardButtons = (indicators) => {

    var btns = []

    indicators.forEach((indicator, index) => {
        var victimProperty = 'indicators.' + index + '.enabled'
        var properties = {}
        properties['indicators[' + index + '].enabled'] = !indicator.enabled
        var cb = utils.getButtonCallbackData('settings', properties, null, 'Not')

        btns.push([{ text: `${indicator.enabled ? '✓ ' : ''}${indicator.name}`, callback_data: cb }])
    })

    btns.push([{ text: `← Back`, callback_data: utils.getButtonCallbackData('navigation', {}, 'back', 'Settings') }])
    return btns
}