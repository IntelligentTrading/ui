
var help = {
    command_list : `/price - The current valuation of a coin. For example: /price BTC
/volume - Last 24 hour volume data. For example: /volume BTC
/feedback - Help us improve the Bot with your own ideas.
/help - Get a list of all commands.`,
    text : function(){return `Here's a list of all commands currently available:\n\n${this.command_list}`}
}

exports.help = help;