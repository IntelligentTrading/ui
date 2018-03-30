var Keyboard = require('./keyboard').Keyboard;
var tickers = require('../data/tickers').tickers;

var counter_currencies = [];

tickers.counter_currencies().then(tccs => {
    counter_currencies = tccs
});

var userSettings;
var currencies_button = [{ text: "Edit Coin Watchlist", callback_data: "settings.NAV:COI" }];
var panic_button = [{ text: "Turn Crowd Sentiment OFF", callback_data: "settings.DB:CROWD_" }];

var msg = "Here you can set up your signal preferences.";
var kb = new Keyboard(msg, []);
kb.showBackButton = true;



kb.updateSettings = (settings) => {
    userSettings = settings;
    var followed_counter_currencies = [];
    userSettings.counter_currencies.forEach(counter_currency => {
        followed_counter_currencies.push(`alt/${counter_currencies[counter_currency].symbol}`)
    })

    panic_button[0].text = settings.is_crowd_enabled ? 'Turn Crowd Sentiment OFF' : 'Turn Crowd Sentiment ON';
    panic_button[0].callback_data = settings.is_crowd_enabled
        ? panic_button[0].callback_data.split('_')[0] + '_False'
        : panic_button[0].callback_data.split('_')[0] + '_True';

    if (followed_counter_currencies.length == 0)
        kb.message = `${msg} You are not following any coin.`;
    else {
        kb.message = `${msg} You are currently following ${followed_counter_currencies.join(', ')}.`
    }
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
                counter_currency_buttons.push({ text: `${counter_currency.followed ? '✓ ' : ''} alt/${counter_currency.symbol}`, callback_data: `settings.DB:SIG_${counter_currency.symbol}_${counter_currency_index}_${counter_currency.followed ? 'False' : 'True'}` });
        });

        buttons.push(counter_currency_buttons);
        buttons.push(currencies_button);
        buttons.push(panic_button);
        buttons.push(kb.backButton);
        resolve(buttons);
    });
}

exports.kb = kb;