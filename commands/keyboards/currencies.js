var Keyboard = require('./keyboard').Keyboard;
var rp = require('request-promise');
var _ = require('lodash');
var tickers = require('../data/tickers').tickers;

var buttons_line = [];
var userSettings;
var currencies = []; // ? Should I use tickers.get() ? I'm adding a field here and the array is shared, so maybe not.

var PAGE_COLS = 5;
var PAGE_ROWS = 5;
var PAGE_SIZE = PAGE_COLS * PAGE_ROWS;

var current_page = 0;

var getCurrentPage = (page_num = 0) => {
    var buttons = [];

    current_page = parseInt(page_num);
    var total_number_of_pages = currencies.length / PAGE_SIZE;

    // 0 < 4
    var next_page = current_page < total_number_of_pages - 1 ? current_page + 1 : 0;
    var prev_page = current_page > 0 ? current_page - 1 : total_number_of_pages - 1;

    var arrows = [{ text: "<<", callback_data: `settings.NAV:COI_${prev_page}` }, { text: ">>", callback_data: `settings.NAV:COI_${next_page}` }];
    var cancel = [{ text: "Cancel", callback_data: "settings.NAV:MAIN" }];

    //get PAGE_SIZE elements for each page (25)
    var page_buttons = buttons_line.slice(current_page * PAGE_SIZE, current_page * PAGE_SIZE + PAGE_SIZE);

    for (i = 0; i <= total_number_of_pages; i++) {
        var page_buttons_row = page_buttons.slice(i * PAGE_COLS, i * PAGE_COLS + PAGE_COLS);
        buttons.push(page_buttons_row);
    }
    buttons.push(arrows);
    //I redefined the getButtons method, therefore I have to add CANCEL manually
    buttons.push(kb.cancelButton);
    return buttons;
}

var updateFollowedButtons = () => {

    if (process.env.LOCAL_ENV) {
        userSettings = { currencies: [] };
        userSettings.currencies.push('ETH', 'NEO', 'OMG');
    }

    buttons_line = [];

    if (userSettings.currencies == undefined) {
        if (userSettings == undefined)
            userSettings = {};

        userSettings.currencies = []
    }

    currencies.forEach(currency => {
        currency.followed = userSettings.currencies.indexOf(currency.symbol) >= 0;
        buttons_line.push({ text: `${currency.followed ? '• ' : ''}${currency.symbol}`, callback_data: `settings.DB:COI_${currency.symbol}_${currency.followed ? 'False' : 'True'}` });
    });
}

var loadcurrencies = () => {
    return tickers.get().then(tkrs => { currencies = tkrs });
}

var msg = "Please select the *currencies* to follow/unfollow in order to receive related signals.";
var kb = new Keyboard(msg, []);

kb.updateSettings = (settings) => {
    userSettings = settings;
};
kb.getButtons = (page_num) => loadcurrencies().then(() => {
    updateFollowedButtons();
    return getCurrentPage(page_num);
})


exports.kb = kb;