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
        disable_web_page_preview: "true",
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
    return `Validity Setting\n\nA shorter validity setting will show signals more often. 1hr validity signals are for high risk and higher frequency traders.\nLearn more in the [User Guide](http://intelligenttrading.org/guides/bot-user-guide/#profile-customization-risk-level--trading-horizon)`
}

var getKeyboardButtons = (horizon) => {

    var investor_callback = utils.getButtonCallbackData('settings', { horizon: horizons[0] }, null, 'Trader')
    var swing_callback = utils.getButtonCallbackData('settings', { horizon: horizons[1] }, null, 'Trader')
    var day_callback = utils.getButtonCallbackData('settings', { horizon: horizons[2] }, null, 'Trader')

    var btns = [
        [{ text: `${horizon == horizons[0] ? '✓ ' : ''}24hr`, callback_data: investor_callback }],
        [{ text: `${horizon == horizons[1] ? '✓ ' : ''}4hr`, callback_data: swing_callback }],
        [{ text: `${horizon == horizons[2] ? '✓ ' : ''}1hr`, callback_data: day_callback }],
        [{ text: `← Back`, callback_data: utils.getButtonCallbackData('navigation', {}, 'back', 'Settings') }]
    ]

    return btns
}