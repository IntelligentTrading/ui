var Keyboard = require('./keyboard').Keyboard;

var buttons = [
    [
        { text: "BTC", callback_data: "settings.DB:CUR_BTC" },
        { text: "USDT", callback_data: "settings.DB:CUR_USD" },
        { text: "ETH", callback_data: "settings.DB:CUR_ETH" }
    ]
];

var msg = "Please select the *exchange currencies* in order to receive related signals.";
var kb = new Keyboard(msg, buttons);
exports.kb = kb;