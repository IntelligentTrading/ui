var Keyboard = require('./keyboard').Keyboard;

var buttons = [
    [{ text: "I've read and accept", callback_data: "registration.DB:EULA_True" }]
];

var kb = new Keyboard(`Please read the [EULA](https://en.wikipedia.org/wiki/End-user_license_agreement) before using ITT bot.`, buttons);
kb.showCancelButton = false;
exports.kb = kb;