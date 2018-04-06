var _ = require('lodash')
var dateHelper = require('../../util/dates')
var eventEmitter = require('../../events/botEmitter')
var utils = require('./utils')
var keyboardBot = null
var tickers = require('../data/tickers').tickers

eventEmitter.on('ShowCurKeyboard', (chat_id, message_id, data, page) => { showKeyboard(chat_id, message_id, data, page) })
eventEmitter.on('CurKeyboardChanged', (chat_id, message_id, data, page) => { showKeyboard(chat_id, message_id, data, page) })

var currencies = []
var PAGE_COLS = 5
var PAGE_ROWS = 4
var PAGE_SIZE = PAGE_COLS * PAGE_ROWS;
var current_page = 0

module.exports = (bot) => {
    keyboardBot = bot
    loadCurrencies().then(cc => currencies = cc)
}

var showKeyboard = (chat_id, message_id, userSettings, page) => {
    current_page = parseInt(page)
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
    var keyboard_rows = loadKeyboardRows(userSettings)
    return {
        text: getKeyboardText(),
        buttons: getKeyboardButtons(keyboard_rows)
    }
}

var getKeyboardText = () => {
    return "Please select the *coins* to follow/unfollow in order to receive related signals."
}

var getKeyboardButtons = (keyboard_rows) => {

    var buttons = []
    var total_number_of_pages = Math.ceil(currencies.length / PAGE_SIZE)

    for (i = 0; i < keyboard_rows.length; i++) {
        var page_idx = Math.floor(i / PAGE_SIZE)
        keyboard_rows[i].callback_data = utils.getButtonCallbackData('settings', keyboard_rows[i].currency_data, null, `Cur(${page_idx})`)
    }

    // 0 < 4
    var next_page = current_page < total_number_of_pages - 1 ? current_page + 1 : 0;
    var prev_page = current_page > 0 ? current_page - 1 : total_number_of_pages - 1;

    var prev_arrow_callback = utils.getButtonCallbackData('navigation', {}, null, `Cur(${prev_page})`)
    var next_arrow_callback = utils.getButtonCallbackData('navigation', {}, null, `Cur(${next_page})`)

    var arrows = [{ text: "<<", callback_data: prev_arrow_callback }, { text: ">>", callback_data: next_arrow_callback }]

    var back = [{ text: `Back`, callback_data: utils.getButtonCallbackData('navigation', {}, 'back', 'Settings') }]

    //get PAGE_SIZE elements for each page (25)
    var page_buttons = keyboard_rows.slice(current_page * PAGE_SIZE, current_page * PAGE_SIZE + PAGE_SIZE);

    while (page_buttons.length < PAGE_SIZE) {
        page_buttons.push({ text: ' ', callback_data: 'IGNORE' });
    }

    for (i = 0; i <= total_number_of_pages; i++) {
        var page_buttons_row = page_buttons.slice(i * PAGE_COLS, i * PAGE_COLS + PAGE_COLS);
        buttons.push(page_buttons_row);
    }
    buttons.push(arrows)
    buttons.push(back)
    return buttons;
}

var loadCurrencies = () => {
    return tickers.get().then(tkrs => {
        return tkrs.sort((a, b) => {
            return parseInt(a.rank) - parseInt(b.rank)
        })
    })
}

var loadKeyboardRows = (userSettings) => {
    if (userSettings == undefined)
        userSettings = {}

    if (userSettings.transaction_currencies == undefined) {
        userSettings.transaction_currencies = []
    }

    var kb_rows = []
    currencies.forEach(currency => {
        currency.followed = userSettings.transaction_currencies.indexOf(currency.symbol) >= 0;
        kb_rows.push({ text: `${currency.followed ? '✓ ' : ''}${currency.symbol}`, currency_data: { sym: currency.symbol, in: !currency.followed } })
    })

    return kb_rows
}