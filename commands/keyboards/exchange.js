var Keyboard = require('./keyboard').Keyboard;
var tickers = require('../data/tickers').tickers;

var counter_currencies = [];

tickers.counter_currencies().then(tccs => {
    counter_currencies = tccs
});

var userSettings;
var currencies_button = [{ text: "Edit Coin Watchlist", callback_data: "settings.NAV:COI" }];

var msg = "Here you can set up your signal preferences, choose your favorite trading pairs and edit your coin watchlist.";
var kb = new Keyboard(msg, []);
kb.showBackButton = true;

kb.updateSettings = (settings) => {
    userSettings = settings;
}

kb.getButtons = () => {
    return new Promise((resolve, reject) => {
        var counter_currency_buttons = [];
        var buttons = [];

        if (userSettings == undefined)
            userSettings = {};

        if (userSettings.counter_currencies == undefined) {
            userSettings.counter_currencies = []
        }

        counter_currencies.forEach(counter_currency => {
            var counter_currency_index = counter_currencies.indexOf(counter_currency);

            counter_currency.followed = userSettings.counter_currencies.indexOf(counter_currency_index) >= 0;
            if (counter_currency.enabled)
                counter_currency_buttons.push({ text: `${counter_currency.followed ? '• ' : ''} alt/${counter_currency.symbol}`, callback_data: `settings.DB:SIG_${counter_currency.symbol}_${counter_currency_index}_${counter_currency.followed ? 'False' : 'True'}` });
        });

        buttons.push(counter_currency_buttons);
        buttons.push(currencies_button);
        buttons.push(kb.backButton);
        resolve(buttons);
    });
}

exports.kb = kb;