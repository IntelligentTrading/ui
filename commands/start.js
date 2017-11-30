var help = require('./help').help;
var eula_kb = require('./keyboards/eula').kb;

var start = {
    eula_kb: eula_kb,
    text: "Hi! I'm the ITT Trading Bot. In order to activate your account use the command /token _<your token>_",
}

exports.start = start;