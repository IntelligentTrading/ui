var Keyboard = require('./keyboard').Keyboard;
var rp = require('request-promise');
var _ = require('lodash');

var buttons = [];
var followed_coins = [];
var buttons_line = [];
var userSettings;
var symbols;

var PAGE_COLS = 5;
var PAGE_ROWS = 5;
var PAGE_SIZE = PAGE_COLS * PAGE_ROWS;

var current_page = 0;

var getCurrentButtons = (page_num = 0) => {
    buttons = [];

    current_page = parseInt(page_num);
    var total_number_of_pages = symbols.length / PAGE_SIZE;

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

var loadCoins = (page_num) => {
    var node_services_endpoint = process.env.ITT_NODE_SERVICES;

    if (userSettings) {
        followed_coins = userSettings.coins ? userSettings.coins : [];
        //! Testing
        followed_coins.push('ETH', 'NEO', 'OMG');
    }

    if (symbols) {
        return new Promise((resolve, reject) => {
            resolve(getCurrentButtons(page_num));
        });
    }
    else {
        return rp(`${node_services_endpoint}/tickers`)
            .then((json_tickers) => {
                var tickers = JSON.parse(json_tickers);
                symbols = [];

                Object.keys(tickers).forEach((key) => {
                    var symbol = tickers[key].info.symbol;
                    symbols.push(symbol);
                });

                symbols.forEach(s => {
                    var followed = followed_coins.indexOf(s) < 0
                    buttons_line.push({ text: `${followed ? '' : '• '}${s}`, callback_data: `settings.DB:COI_${s}_${followed ? 'False' : 'True'}` });
                });

            })
            .then(() => {
                return getCurrentButtons();
            })
            .catch((reason) => {
                console.log(reason)
            });
    }
}


var msg = "Please select the *coins* to follow/unfollow in order to receive related signals.";
var kb = new Keyboard(msg, buttons);

kb.setSettings = (settings) => {
    userSettings = settings;
};
kb.getButtons = (page) => loadCoins(page);

exports.kb = kb;