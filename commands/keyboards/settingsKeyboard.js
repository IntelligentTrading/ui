var _ = require('lodash')
var eventEmitter = require('../../events/botEmitter')
var keyboardUtils = require('./keyboardUtils')
var subscriptionUtils = require('../../util/dates')
var keyboardBot = null
var tickers = require('../../data/tickers')
var api = require('../../core/api')
var ext = require('../../util/extensions')

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
        disable_web_page_preview: "true",
        reply_markup: {
            inline_keyboard: keyboardObject.buttons
        }
    })
}

var showKeyboard = async (telegram_chat_id, settings) => {
    var keyboardObject = await getKeyboardObject(settings)

    var hasValidSubscription = subscriptionUtils.hasValidSubscription(settings)
    var keyboardText = keyboardObject.text

    var options = { parse_mode: "Markdown", disable_web_page_preview: "true" }
    if (hasValidSubscription || settings.is_ITT_team) {
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
    var tradingPairs = settings.counter_currencies.map(scc => `${_.find(counter_currencies, cc => cc.index == scc).symbol}`).join(', ')
    var daysLeft = Math.max(0, parseFloat(subscriptionUtils.getDaysLeftFrom(subscriptionExpirationDate)))
    var currentPlan = (daysLeft > 0 || settings.is_ITT_team) ? 'Starter' : (hasValidSubscription ? 'FREE+' : 'FREE')

    return `Settings | *${currentPlan}* plan

‣ Risk: *${hasValidSubscription ? horizonToRisk(settings.horizon).toSentenceCase() : 'High'}* ([Learn more](https://blog.intelligenttrading.org/intelligent-trading-beta-bot-user-guide-2f597c66efa7))
‣ Trade currencies: *${hasValidSubscription ? tradingPairs : 'USDT'}*
‣ Sentiment alerts: *${settings.is_crowd_enabled ? 'On' : 'Off'}*
${getDescriptionForPlan(currentPlan)}

Tap or type /subscribe to extend or upgrade your plan.       
${hasValidSubscription ? 'Tap below to edit your settings or run the /wizard:' : 'Note: you cannot edit your settings with the free plan!'}`
}

var getDescriptionForPlan = (plan) => {
    switch (plan) {
        case 'Starter': return '‣ Upside and Downside RSI and Ichimoku signals\n‣ RSI proprietary signals\n‣ Poloniex, Binance, Bittrex ';
        case 'FREE+': return '‣ Upside and Downside RSI and Ichimoku signals (upgrade for more)\n‣ Poloniex exchange (upgrade for more)';
        case 'FREE': return '‣ Limited number of coins (Upgrade for more)\n‣ Upside alerts only (Upgrade for more)\n‣ RSI and Ichimoku signals (Upgrade for more)\n‣ Poloniex exchange (Upgrade for more)';
        default: ;
    }
}

var getKeyboardButtons = (settings) => {

    var alertsCallbackData = keyboardUtils.getButtonCallbackData('settings', { is_muted: !settings.is_muted }, null, 'Settings')
    var editSignalsCallbackData = keyboardUtils.getButtonCallbackData('navigation', {}, null, 'Sig')
    var editTraderCallbackData = keyboardUtils.getButtonCallbackData('navigation', { horizon: settings.horizon }, null, 'Trader')

    return [
        [{ text: `Turn alerts ${settings.is_muted ? 'ON' : 'OFF'}`, callback_data: alertsCallbackData }],
        [{ text: "Signals setting", callback_data: editSignalsCallbackData }],
        [{ text: "Risk setting", callback_data: editTraderCallbackData }],
        [{ text: "Close", callback_data: keyboardUtils.getButtonCallbackData('navigation', {}, 'close') }]
    ]
}

var horizonToRisk = (horizon) => {
    var risks = ['high', 'medium', 'low']
    var horizons = ['short', 'medium', 'long']
    return risks[horizons.indexOf(horizon)]
}