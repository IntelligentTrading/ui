var _ = require('lodash')
var eventEmitter = require('../../events/botEmitter')
var utils = require('.//keyboardUtils')
var keyboardBot = null
var tickers = require('../../data/tickers')

eventEmitter.on('ShowSigKeyboard', (chat_id, message_id, data) => { showKeyboard(chat_id, message_id, data) })
eventEmitter.on('SigKeyboardChanged', (chat_id, message_id, data) => { showKeyboard(chat_id, message_id, data) })

var counter_currencies = []

module.exports = function (bot) {
    keyboardBot = bot
    tickers.counter_currencies().then(cc => counter_currencies = cc)
}

var showKeyboard = (chat_id, message_id, userSettings) => {
    var keyboardObject = getKeyboardObject(userSettings)

    keyboardBot.editMessageText(keyboardObject.text, {
        chat_id: chat_id,
        message_id: message_id,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: keyboardObject.buttons
        }
    })
}

var getKeyboardObject = (userSettings) => {
    return {
        text: getKeyboardText(),
        buttons: getKeyboardButtons(userSettings)
    }
}

var getKeyboardText = () => {
    return "Here you can set up your signal preferences."
}

var getKeyboardButtons = (userSettings) => {

    var counter_currency_buttons = []

    if (userSettings == undefined)
        userSettings = {};

    if (userSettings.counter_currencies == undefined) {
        userSettings.counter_currencies = []
    }

    counter_currencies.forEach(counter_currency => {
        counter_currency.followed = userSettings.counter_currencies.indexOf(counter_currency.index) >= 0;
        if (counter_currency.enabled == true) {
            var currencyCallbackData = utils.getButtonCallbackData('settings', { idx: counter_currency.index, in: !counter_currency.followed }, null, 'Sig')
            counter_currency_buttons.push({ text: `${counter_currency.followed ? '✓ ' : ''} alt/${counter_currency.symbol}`, callback_data: currencyCallbackData })
        }
    });

    var crowdSentimentCallbackData = utils.getButtonCallbackData('settings', { is_crowd_enabled: !userSettings.is_crowd_enabled }, null, 'Sig')

    var btns = [
        counter_currency_buttons,
        [{ text: "Edit Coin Watchlist", callback_data: utils.getButtonCallbackData('navigation', {}, null, 'Cur(0)') }],
        [{ text: `Turn Crowd Sentiment ${userSettings.is_crowd_enabled ? 'OFF' : 'ON'}`, callback_data: crowdSentimentCallbackData }],
        [{ text: `Back`, callback_data: utils.getButtonCallbackData('navigation', {}, 'back', 'Settings') }]
    ]
    return btns
}