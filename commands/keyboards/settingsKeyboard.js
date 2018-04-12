var _ = require('lodash')
var eventEmitter = require('../../events/botEmitter')
var keyboardUtils = require('./keyboardUtils')
var subscriptionUtils = require('../../util/dates')
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
    var keyboardObject = getKeyboardObject(user)

    var hasValidSubscription = subscriptionUtils.hasValidSubscription(user)
    var keyboardText = keyboardObject.text

    var options = { parse_mode: "Markdown" }
    if (hasValidSubscription) {
        options.reply_markup = {
            inline_keyboard: keyboardObject.buttons
        }
    }

    keyboardBot.sendMessage(user.telegram_chat_id, keyboardText, options)
}

var getKeyboardObject = (user) => {
    return {
        text: getKeyboardText(user),
        buttons: getKeyboardButtons(user)
    }
}

var getKeyboardText = (user) => {
    var isMuted = user.settings.is_muted
    var hasValidSubscription = subscriptionUtils.hasValidSubscription(user)
    var subscriptionExpirationDate = user.settings.subscriptions.paid
    var daysLeft = Math.max(0, parseFloat(subscriptionUtils.getDaysLeftFrom(subscriptionExpirationDate)))
    var msg = `Your profile is set on *${user.settings.horizon}* horizon.
You will receive paid signals until ${subscriptionExpirationDate.split('T')[0]} (Days left: ${daysLeft}).
Send 1 ITT for each additional day, using the following address as receiver:

*${user.settings.ittWalletReceiverAddress}*

You will be notified as soon as the transaction is confirmed.

${hasValidSubscription ? 'Tap below to edit your settings:' : 'You cannot edit your settings with the free plan'}`
    return msg
}

var getKeyboardButtons = (user) => {

    var settings = user.settings
    var alertsCallbackData = keyboardUtils.getButtonCallbackData('settings', { is_muted: !settings.is_muted }, null, 'Settings')
    var editSignalsCallbackData = keyboardUtils.getButtonCallbackData('navigation', {}, null, 'Sig')
    var editTraderCallbackData = keyboardUtils.getButtonCallbackData('navigation', { horizon: settings.horizon }, null, 'Trader')

    return [
        [{ text: `Turn alerts ${settings.is_muted ? 'ON' : 'OFF'}`, callback_data: alertsCallbackData }],
        [{ text: "Edit Signals", callback_data: editSignalsCallbackData }],
        [{ text: "Edit Trader Profile", callback_data: editTraderCallbackData }],
        [{ text: "Close", callback_data: keyboardUtils.getButtonCallbackData('navigation', {}, 'close') }]
    ]
}