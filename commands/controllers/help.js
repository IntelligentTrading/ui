var moduleBot = null
module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => {
        const chat_id = msg.chat.id

        var command_list = `/start - Start ITT Bot, subscribe to new alerts
        /help - Get a list of all commands
        /settings - Manage your preferences and profile
        /feedback - Help us improve the Bot with your own ideas
        /price - The current valuation of a currency. For example: /price BTC
        /volume - Last 24 hour volume data. For example: /volume BTC`

        moduleBot.sendMessage(chat_id, `Here's a list of all commands currently available:\n\n${command_list}`)
    }
}