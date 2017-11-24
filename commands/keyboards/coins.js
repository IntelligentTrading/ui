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

var getCurrentButtons = (page_num = 0) => {
    buttons = [];

    page_num = parseInt(page_num);
    var total_number_of_pages = symbols.length / PAGE_SIZE;

    // 0 < 4
    var next_page = page_num < total_number_of_pages ? page_num + 1 : 0;
    var prev_page = page_num > 0 ? page_num - 1 : total_number_of_pages;

    var arrows = [{ text: "<<", callback_data: `settings.NAV:COI_${prev_page}` }, { text: ">>", callback_data: `settings.NAV:COI_${next_page}` }];

    buttons_line.slice()// get groups of 5 

    buttons.push(buttons_line);
    buttons.push(arrows);
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

                for (i = 0; i < symbols.length; i++) {
                    symbols.slice(i * PAGE_COLS, i * PAGE_COLS + PAGE_COLS).forEach(s => {
                        var followed = followed_coins.indexOf(s) < 0
                        buttons_line.push({ text: `${followed ? '' : '• '}${s}`, callback_data: `settings.DB:COI_${s}_${followed ? 'False' : 'True'}` });
                    });
                }
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

kb.setSettings = (settings) => { userSettings = settings };
kb.getButtons = (page) => loadCoins(page);

exports.kb = kb;