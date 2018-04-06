var moduleBot = null

module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => {
        const chat_id = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username;
      
        moduleBot.sendMessage(chat_id, `Your chat_id is ${chat_id}, userId ${userId} and username ${username}`)
    }
}