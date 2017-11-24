var Keyboard = require('./keyboard').Keyboard;

var buttons = [
    [{ text: "Only the safest trade signals (Beginners)", callback_data: "settings.DB:RSK_low" }],
    [{ text: "Any signal, reputable coins only (Standard)", callback_data: "settings.DB:RSK_medium" }],
    [{ text: "Any signal, including low value coins (High risk high reward)", callback_data: "settings.DB:RSK_high" }],
    [{ text: "Cancel", callback_data: "settings.NAV:MAIN" }]
];

var msg = "Please select which _risk profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your trader profile.";
var kb = new Keyboard(msg, buttons);
exports.kb = kb;