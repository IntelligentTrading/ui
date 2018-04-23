var _ = require('lodash')
var eventEmitter = require('../../events/botEmitter')
var keyboardUtils = require('./keyboardUtils')
var subscriptionUtils = require('../../util/dates')
var keyboardBot = null
var api = require('../../core/api')
var counter_currencies = ['BTC', '', 'USDT']

eventEmitter.on('ShowSettingsKeyboard', async (user) => { await showKeyboard(user.telegram_chat_id, user.settings) })
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

var showKeyboard = async (telegram_chat_id, settings) => {
    var keyboardObject = await getKeyboardObject(settings)

    var hasValidSubscription = subscriptionUtils.hasValidSubscription(settings)
    var keyboardText = keyboardObject.text

    var options = { parse_mode: "Markdown" }
    if (hasValidSubscription) {
        options.reply_markup = {
            inline_keyboard: keyboardObject.buttons
        }
    }

    keyboardBot.sendMessage(telegram_chat_id, keyboardText, options)
}

var getKeyboardObject = async (settings) => {
    return {
        text: await getKeyboardText(settings),
        buttons: getKeyboardButtons(settings)
    }
}

var getKeyboardText = async (settings) => {
    var isMuted = settings.is_muted
    var hasValidSubscription = subscriptionUtils.hasValidSubscription(settings)
    var subscriptionExpirationDate = settings.subscriptions.paid
    var tradingPairs = settings.counter_currencies.map(cc => `alt/${counter_currencies[parseInt(cc)]}`).join(', ')
    var daysLeft = Math.max(0, parseFloat(subscriptionUtils.getDaysLeftFrom(subscriptionExpirationDate)))
    var paidSignalsMsg = daysLeft > 0 ? `You will receive paid signals until *${subscriptionExpirationDate.split('T')[0]}* (Days left: ${daysLeft}).` : 'You are not subscribed to any paid signal.'
    var tradingProfileMsg = `TRADING PROFILE
‣ Your profile is set on *${settings.horizon}* horizon.
‣ You are notified about *${hasValidSubscription ? tradingPairs : 'alt/USDT'}* signals.
‣ Your crowd sentiment feed is *${settings.is_crowd_enabled ? 'On' : 'Off'}*.`

    var itt_json = await api.getITT()
    var itt = JSON.parse(itt_json)
    var itt_usd_rate = parseFloat(itt.price_usd).toFixed(2)
    var subscriptionMessage = `SUBSCRIPTION DETAILS
${paidSignalsMsg}
To get or extend your paid subscription time send ITT, you will be notified as soon as the transaction is confirmed:

‣ Receiver address: *${settings.ittWalletReceiverAddress}*
‣ ITT/USDT rate: *${itt_usd_rate}*
        
${hasValidSubscription ? 'Tap below to edit your settings:' : 'Note: you cannot edit your settings with the free plan'}`

    return tradingProfileMsg + '\n\n' + subscriptionMessage

}

var getKeyboardButtons = (settings) => {

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