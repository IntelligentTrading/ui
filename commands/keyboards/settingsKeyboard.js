var _ = require('lodash')
var dateHelper = require('../../util/dates')
var eventEmitter = require('../../events/botEmitter')
var utils = require('./utils')
var keyboardBot = null;

eventEmitter.on('ShowSettingsKeyboard', (user) => { showKeyboard(user) })
eventEmitter.on('SettingsKeyboardChanged', (chat_id, message_id, settings) => { updateKeyboard(chat_id, message_id, settings) })

module.exports = function (bot) {
    keyboardBot = bot
}

var updateKeyboard = (chat_id, message_id, settings) => {
    
    var keyboardObject = getKeyboardObject(settings)

    keyboardBot.editMessageText(keyboardObject.text, {
        chat_id: chat_id,
        message_id: message_id,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: keyboardObject.buttons
        }
    })
}

var showKeyboard = (user) => {
    var keyboardObject = getKeyboardObject(user.settings)
    var keyboardText = keyboardObject.text
    var options = {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: keyboardObject.buttons
        }
    }

    keyboardBot.sendMessage(user.telegram_chat_id, keyboardText, options)
}

var getKeyboardObject = (settings) => {
    return {
        text: getKeyboardText(settings),
        buttons: getKeyboardButtons(settings)
    }
}

var getKeyboardText = (userSettings) => {
    var isMuted = userSettings.is_muted;
    var subscriptionExpirationDate = userSettings.subscriptions.paid
    var msg = `Your profile is set on *${userSettings.horizon}* horizon.
You will receive paid signals until ${subscriptionExpirationDate.split('T')[0]} (${Math.max(0, dateHelper.getDaysLeftFrom(subscriptionExpirationDate))} days left).
Send 1 ITT for each additional day, using the following address as receiver:

*${userSettings.ittWalletReceiverAddress}*

You will be notified as soon as the transaction is confirmed.

Tap below to edit your settings:`
    return msg
}

var getKeyboardButtons = (settings) => {

    var alertsCallbackData = utils.getButtonCallbackData('settings', { is_muted: !settings.is_muted }, null, 'Settings')
    var editSignalsCallbackData = utils.getButtonCallbackData('navigation', {}, null, 'Sig')
    var editTraderCallbackData = utils.getButtonCallbackData('navigation', { horizon: settings.horizon }, null, 'Trader')

    return [
        [{ text: `Turn alerts ${settings.is_muted ? 'ON' : 'OFF'}`, callback_data: alertsCallbackData }],
        [{ text: "Edit Signals", callback_data: editSignalsCallbackData }],
        [{ text: "Edit Trader Profile", callback_data: editTraderCallbackData }],
        [{ text: "Close", callback_data: utils.getButtonCallbackData('navigation', {}, 'close') }]
    ]
}