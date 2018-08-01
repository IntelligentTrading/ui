var _ = require('lodash')
var eventEmitter = require('../../events/botEmitter')
var keyboardUtils = require('./keyboardUtils')
var subscriptionUtils = require('../../util/dates')
var keyboardBot = null
var tickers = require('../../data/tickers')
var api = require('../../core/api')
var ext = require('../../util/extensions')
var moment = require('moment')

eventEmitter.on('ShowSettingsKeyboard', async (user) => { await showKeyboard(user.telegram_chat_id, user.settings) })
eventEmitter.on('SettingsKeyboardChanged', async (chat_id, message_id, settings) => { await updateKeyboard(chat_id, message_id, settings) })

var counter_currencies = []
module.exports = async (bot) => {
    keyboardBot = bot
    counter_currencies = await tickers.counter_currencies()
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

var showKeyboard = async (telegram_chat_id, settings) => {
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
}

var getKeyboardObject = async (telegram_chat_id, settings) => {
    return {
        text: await getKeyboardText(settings),
        buttons: getKeyboardButtons(telegram_chat_id, settings)
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

Referral Code: ${settings.referral}

‣ Risk: *${hasValidSubscription ? horizonToRisk(settings.horizon).toSentenceCase() : 'High'}* ([Learn more](http://intelligenttrading.org/guides/bot-user-guide/#profile-customization-risk-level--trading-horizon))
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

var getKeyboardButtons = (telegram_chat_id, settings) => {

    var alertsCallbackData = keyboardUtils.getButtonCallbackData('settings', { is_muted: !settings.is_muted }, null, 'Settings')
    var editSignalsCallbackData = keyboardUtils.getButtonCallbackData('navigation', {}, null, 'Sig')
    var editTraderCallbackData = keyboardUtils.getButtonCallbackData('navigation', { horizon: settings.horizon }, null, 'Trader')
    
    return [
        [{ text: "Open in web app", url: createMagicLink(telegram_chat_id) }],
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

var createMagicLink = (telegram_chat_id) => {

    var token = {
        telegram_chat_id: telegram_chat_id,
        exp: moment().add(10, 'days')
    }

    var tokenString = Buffer.from(JSON.stringify(token)).toString('base64')
    var magicLink = `https://itf-settings-${process.env.NODE_ENV}.herokuapp.com/#/me/${tokenString}`
    console.log(magicLink)

    return magicLink
}