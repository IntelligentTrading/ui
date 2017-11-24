var Keyboard = require('./keyboard').Keyboard;

var buttons = [
    [{ text: "Investor: Long term trade signals. Exit and entry points for HODL. (Low risk)", callback_data: "settings.DB:HRZ_long" }],
    [{ text: "Swingtrader: Short/near term trade signals. Profit from volatility. (Medium risk)", callback_data: "settings.DB:HRZ_medium" }],
    [{ text: "Daytrader: Very short term trade signals. Getting in and out trades. (High risk)", callback_data: "settings.DB:HRZ_short" }]
];

var msg = "Please select which _trader profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your risk profile.";
var kb = new Keyboard(msg, buttons);
exports.kb = kb;