var help = require('./help').help;

var start = {
    text: "Hi! I'm the ITT Trading Bot. I'll be providing you with trading signals whenever an interesting opportunity comes up."+
    "This might take some time. Here are some helpful commands you can try out in the meanwhile:\n\n"+help.command_list,
}

exports.start = start;