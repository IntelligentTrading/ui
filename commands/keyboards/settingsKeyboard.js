var _ = require('lodash')
var eventEmitter = require('../../events/botEmitter')
var keyboardUtils = require('./keyboardUtils')
var subscriptionUtils = require('../../util/dates')
var keyboardBot = null
var tickers = require('../../data/tickers')
var api = require('../../core/api')

eventEmitter.on('ShowSettingsKeyboard', async (user) => { await showKeyboard(user.telegram_chat_id, user.settings) })
eventEmitter.on('SettingsKeyboardChanged', async (chat_id, message_id, settings) => { await updateKeyboard(chat_id, message_id, settings) })

var counter_currencies = []
module.exports = async (bot) => {
    keyboardBot = bot
    counter_currencies = await tickers.counter_currencies()
}

var updateKeyboard = async (chat_id, message_id, settings) => {

    var keyboardObject = await getKeyboardObject(settings)

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
    var tradingPairs = settings.counter_currencies.map(scc => `alt/${_.find(counter_currencies, cc => cc.index == scc).symbol}`).join(', ')
    var daysLeft = Math.max(0, parseFloat(subscriptionUtils.getDaysLeftFrom(subscriptionExpirationDate)))
    var currentPlan = daysLeft > 0 ? 'Starter' : (hasValidSubscription ? 'FREE+' : 'FREE')

    return `Trading Profile - ${currentPlan} plan

‣ Your profile is set on *${settings.horizon}* horizon.
‣ You are notified about *${hasValidSubscription ? tradingPairs : 'alt/USDT'}* signals.${!hasValidSubscription ? '\n‣ Limited number of coins.\n‣ You are receiving upside alerts only.' : ''}
‣ Your crowd sentiment feed is *${settings.is_crowd_enabled ? 'On' : 'Off'}*.

Tap or type /subscribe to extend or upgrade your plan.        
${hasValidSubscription ? 'Tap below to edit your settings:' : 'Note: you cannot edit your settings with the free plan!'}`
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