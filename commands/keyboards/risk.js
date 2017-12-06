var Keyboard = require('./keyboard').Keyboard;

var risks = ['low', 'medium', 'high'];
var buttons = [];

var msg = "Please select which _risk profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your trader profile.";
var kb = new Keyboard(msg, buttons);
kb.updateSettings = (settings) => {
    kb.buttons = [];
    kb.buttons.push([{ text: `${settings.risk == risks[0] ? '• ' : ''} Only the safest trade signals (Beginners)`, callback_data: `settings.DB:RSK_${risks[0]}` }]);
    kb.buttons.push([{ text: `${settings.risk == risks[1] ? '• ' : ''}Any signal, reputable currencies only (Standard)`, callback_data: `settings.DB:RSK_${risks[1]}` }]);
    kb.buttons.push([{ text: `${settings.risk == risks[2] ? '• ' : ''}Any signal, including low value currencies (High risk high reward)`, callback_data: `settings.DB:RSK_${risks[2]}` }]);

}

exports.kb = kb;