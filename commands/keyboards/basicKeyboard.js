var _ = require('lodash')
var eventEmitter = require('../../events/botEmitter')
var keyboardUtils = require('./keyboardUtils')
var subscriptionUtils = require('../../util/dates')
var keyboardBot = null

eventEmitter.on('ShowBasicKeyboard', async (chat_id, message_id, settings) => {
    await updateKeyboard(chat_id, message_id, settings)
})
eventEmitter.on('BasicKeyboardChanged', async (chat_id, message_id, settings) => { await updateKeyboard(chat_id, message_id, settings) })

module.exports = (bot) => {
    keyboardBot = bot
}

var updateKeyboard = async (telegram_chat_id, message_id, settings) => {

    var keyboardObject = await getKeyboardObject(telegram_chat_id, settings)

    keyboardBot.editMessageText(keyboardObject.text, {
        chat_id: telegram_chat_id,
        message_id: message_id,
        parse_mode: 'Markdown',
        disable_web_page_preview: "true",
        reply_markup: {
            inline_keyboard: keyboardObject.buttons
        }
    })
}

/*var showKeyboard = async (telegram_chat_id, settings) => {
    var keyboardObject = await getKeyboardObject(telegram_chat_id, settings)

    var hasValidSubscription = subscriptionUtils.hasValidSubscription(settings)
    var keyboardText = keyboardObject.text

    var options = { parse_mode: "Markdown", disable_web_page_preview: "true" }
    if (hasValidSubscription || settings.is_ITT_team) {

        options.reply_markup = {
            inline_keyboard: keyboardObject.buttons
        }
    }

    keyboardBot.sendMessage(telegram_chat_id, keyboardText, options)
}*/

var getKeyboardObject = (telegram_chat_id, settings) => {
    return {
        text: getKeyboardText(settings),
        buttons: getKeyboardButtons(telegram_chat_id, settings)
    }
}

var getKeyboardText = (settings) => {
    return 'Basic Settings'
}

var getKeyboardButtons = (telegram_chat_id, settings) => {

    var alertsCallbackData = keyboardUtils.getButtonCallbackData('settings', { is_muted: !settings.is_muted }, null, 'Settings')
    var editSignalsCallbackData = keyboardUtils.getButtonCallbackData('navigation', {}, null, 'Sig')
    var editTraderCallbackData = keyboardUtils.getButtonCallbackData('navigation', { horizon: settings.horizon }, null, 'Trader')

    return [
        [{ text: `Turn alerts ${settings.is_muted ? 'ON' : 'OFF'}`, callback_data: alertsCallbackData }],
        [{ text: "Signals setting", callback_data: editSignalsCallbackData }],
        [{ text: "Risk setting", callback_data: editTraderCallbackData }],
        [{ text: `← Back`, callback_data: keyboardUtils.getButtonCallbackData('navigation', {}, 'back', 'Settings') }]
    ]
}