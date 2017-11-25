var Keyboard = require('./keyboard').Keyboard;

var quota_currencies = [
        {symbol:'USD', followed: false },
        {symbol:'ETH', followed: false },
        {symbol:'BTC', followed: false }
];

var userSettings;
var altcoins_button = [{ text: "Altcoins list", callback_data: "settings.NAV:COI" }];

var msg = "Here you can set up your signal preferences, choose the altcoins to follow and set the exchange quote currencies.";
var kb = new Keyboard(msg, []);
kb.showCancelButton = true;

kb.updateSettings = (settings) => {
    userSettings = settings;
}

kb.getButtons = () => {
    return new Promise((resolve, reject) => {
        var quota_buttons = [];
        var buttons = [];

        if (process.env.LOCAL_ENV) {
            userSettings = { quota_currencies: [] };
            userSettings.quota_currencies.push('BTC');
        }

        if (userSettings.quota_currencies == undefined) {
            if (userSettings == undefined)
                userSettings = {};
    
            userSettings.quota_currencies = []
        }
        
        quota_currencies.forEach(quota_currency => {
            quota_currency.followed = userSettings.quota_currencies.indexOf(quota_currency.symbol) >= 0;
            quota_buttons.push({ text: `${quota_currency.followed ? '• ':''} alt/${quota_currency.symbol}`, callback_data: `settings.DB:SIG_${quota_currency.symbol}_${quota_currency.followed ? 'False' : 'True'}` });
        });

        buttons.push(quota_buttons);
        buttons.push(altcoins_button);
        buttons.push(kb.cancelButton);
        resolve(buttons);
    });
}

exports.kb = kb;