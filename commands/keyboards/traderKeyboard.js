var _ = require('lodash')
var dateHelper = require('../../util/dates')
var eventEmitter = require('../../events/botEmitter')
var utils = require('./keyboardUtils')
var keyboardBot = null;

eventEmitter.on('ShowTraderKeyboard', (chat_id, message_id, data) => { showKeyboard(chat_id, message_id, data) })
eventEmitter.on('TraderKeyboardChanged', (chat_id, message_id, data) => { showKeyboard(chat_id, message_id, data) })

module.exports = function (bot) {
    keyboardBot = bot
}

var horizons = ['long', 'medium', 'short']

var showKeyboard = (chat_id, message_id, userSettings) => {
    var keyboardObject = getKeyboardObject(userSettings.horizon)

    keyboardBot.editMessageText(keyboardObject.text, {
        chat_id: chat_id,
        message_id: message_id,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: keyboardObject.buttons
        }
    })
}

var getKeyboardObject = (horizon) => {
    return {
        text: getKeyboardText(horizon),
        buttons: getKeyboardButtons(horizon)
    }
}

var getKeyboardText = () => {
    return "Please select which trader profile suits you best.\nI will adjust your signals accordingly."
}

var getKeyboardButtons = (horizon) => {

    var investor_callback = utils.getButtonCallbackData('settings', { horizon: horizons[0] }, null, 'Trader')
    var swing_callback = utils.getButtonCallbackData('settings', { horizon: horizons[1] }, null, 'Trader')
    var day_callback = utils.getButtonCallbackData('settings', { horizon: horizons[2] }, null, 'Trader')

    var btns = [
        [{ text: `${horizon == horizons[0] ? '✓ ' : ''}Investor: Long term trade signals. Exit and entry points for HODL. (Low risk)`, callback_data: investor_callback }],
        [{ text: `${horizon == horizons[1] ? '✓ ' : ''}Swingtrader: Short/near term trade signals. Profit from volatility. (Medium risk)`, callback_data: swing_callback }],
        [{ text: `${horizon == horizons[2] ? '✓ ' : ''}Daytrader: Very short term trade signals. Getting in and out trades. (High risk)`, callback_data: day_callback }],
        [{ text: `Back`, callback_data: utils.getButtonCallbackData('navigation', {}, 'back', 'Settings') }]
    ]

    return btns
}