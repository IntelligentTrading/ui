var _ = require('lodash')
var eventEmitter = require('../../events/botEmitter')
var keyboardUtils = require('./keyboardUtils')
var subscriptionUtils = require('../../util/dates')
var keyboardBot = null
var tickers = require('../../data/tickers')
var moment = require('moment')

eventEmitter.on('ShowSettingsKeyboard', (user) => { showKeyboard(user.telegram_chat_id, user.settings) })
eventEmitter.on('SettingsKeyboardChanged', (chat_id, message_id, settings) => { updateKeyboard(chat_id, message_id, settings) })

var counter_currencies = []
module.exports = async (bot) => {
    keyboardBot = bot
    counter_currencies = await tickers.counter_currencies()
}

var updateKeyboard = (telegram_chat_id, message_id, settings) => {

    var keyboardObject = getKeyboardObject(telegram_chat_id, settings)

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

var showKeyboard = (telegram_chat_id, settings) => {
    var keyboardObject = getKeyboardObject(telegram_chat_id, settings)
    var keyboardText = keyboardObject.text

    var options = { parse_mode: "Markdown", disable_web_page_preview: "true" }


    options.reply_markup = {
        inline_keyboard: keyboardObject.buttons
    }

    keyboardBot.sendMessage(telegram_chat_id, keyboardText, options).catch(err => console.log(err))
}

var getKeyboardObject = (telegram_chat_id, settings) => {
    return {
        text: getKeyboardText(settings),
        buttons: getKeyboardButtons(telegram_chat_id, settings)
    }
}

var getKeyboardButtons = (telegram_chat_id, settings) => {

    var hsl = subscriptionUtils.getHighestSubscriptionLevel(settings)
    var settingsButtons = [[{ text: "All Settings", url: createMagicLink(telegram_chat_id) }]]
    settingsButtons.push([{ text: "Basic Settings", callback_data: keyboardUtils.getButtonCallbackData('navigation', {}, null, 'Basic') }])
    settingsButtons.push([{ text: "Close", callback_data: keyboardUtils.getButtonCallbackData('navigation', {}, 'close') }])
    return settingsButtons
}

var getKeyboardText = (settings) => {
    var hasValidSubscription = subscriptionUtils.hasValidSubscription(settings)
    var subscriptionExpirationDate = settings.subscriptions.paid
    settings.counter_currencies.map(scc => {
        var matchingCC = _.find(counter_currencies, cc => cc.index == scc)
        return matchingCC ? matchingCC.symbol : ''
    }).filter(el => el != '').join(', ')
    var daysLeft = Math.max(0, parseFloat(subscriptionUtils.getDaysLeftFrom(subscriptionExpirationDate)))

    var currentPlan = (daysLeft > 0 || settings.is_ITT_team || settings.staking.diecimila) ? 'Pro' : 'FREE'
    var referral_link = `https://t.me/${process.env.TELEGRAM_BOT_NAME.replace('@', '')}?start=refcode_${settings.referral}`

    return `Settings | *${currentPlan}* plan

Tap or type /subscribe to ${hasValidSubscription ? 'extend' : 'upgrade'} your plan. ([View Plans](http://intelligenttrading.org/pricing/?utm_source=${hasValidSubscription ? 'starter_bot_settings' : 'free_bot_settings'}))`
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