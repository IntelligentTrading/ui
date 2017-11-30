var main_kb = require('./main.js').kb;
var risk_kb = require('./risk.js').kb;
var trader_kb = require('./trader.js').kb;
var exchange_kb = require('./exchange.js').kb;
var coins_kb = require('./coins.js').kb;
var eula_kb = require('./eula.js').kb;

var keyboards = {
    main_keyboard: main_kb,
    risk_keyboard: risk_kb,
    trader_keyboard: trader_kb,
    base_currency_keyboard: exchange_kb,
    coins_keyboard: coins_kb,
    eula_keyboard: eula_kb
}

keyboards.updateKeyboardsSettings = (settings) => {
    Object.keys(keyboards).forEach(kb => {
        if (kb != 'updateKeyboardsSettings')
            keyboards[kb].updateSettings(settings);
    });
}

exports.keyboards = keyboards;