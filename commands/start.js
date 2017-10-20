var help = require('./help').help;
var storage = require('../db/storage').storage;

var start = {
    text: "Hi! I'm the ITT Trading Bot. I'll be providing you with trading signals whenever an interesting opportunity comes up." +
    "This might take some time. Here are some helpful commands you can try out in the meanwhile:\n\n" + help.command_list,
    subscribe: (chat_id) => storage.saveSettings(chat_id)
}

exports.start = start;