var Keyboard = require('./keyboard').Keyboard;

var horizons = ['long', 'medium', 'short'];
var buttons = [];

var msg = "Please select which _trader profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your risk profile.";
var kb = new Keyboard(msg, buttons);
kb.updateSettings = (settings) => {
    kb.buttons = [];
    kb.buttons.push([{ text: `${settings.horizon == horizons[0] ? '• ' : ''}Investor: Long term trade signals. Exit and entry points for HODL. (Low risk)`, callback_data: `settings.DB:HRZ_${horizons[0]}` }]);
    kb.buttons.push([{ text: `${settings.horizon == horizons[1] ? '• ' : ''}Swingtrader: Short/near term trade signals. Profit from volatility. (Medium risk)`, callback_data: `settings.DB:HRZ_${horizons[1]}` }]);
    kb.buttons.push([{ text: `${settings.horizon == horizons[2] ? '• ' : ''}Daytrader: Very short term trade signals. Getting in and out trades. (High risk)`, callback_data: `settings.DB:HRZ_${horizons[2]}` }]);
}

exports.kb = kb;