var Keyboard = require('./keyboard').Keyboard;

var counter_currencies = [
        {symbol:'USD', followed: false },
        {symbol:'ETH', followed: false },
        {symbol:'BTC', followed: false }
];

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

        if (process.env.LOCAL_ENV) {
            userSettings = { counter_currencies: [] };
            userSettings.counter_currencies.push('BTC');
        }

        if (userSettings.counter_currencies == undefined) {
            if (userSettings == undefined)
                userSettings = {};
    
            userSettings.counter_currencies = []
        }
        
        counter_currencies.forEach(counter_currency => {
            counter_currency.followed = userSettings.counter_currencies.indexOf(counter_currency.symbol) >= 0;
            counter_currency_buttons.push({ text: `${counter_currency.followed ? '• ':''} alt/${counter_currency.symbol}`, callback_data: `settings.DB:SIG_${counter_currency.symbol}_${counter_currency.followed ? 'False' : 'True'}` });
        });

        buttons.push(counter_currency_buttons);
        buttons.push(currencies_button);
        buttons.push(kb.backButton);
        resolve(buttons);
    });
}

exports.kb = kb;