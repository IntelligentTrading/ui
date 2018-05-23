var api = require('../../core/feedbackApi')

var moduleBot = null
module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => {
        const chat_id = msg.chat.id
        const username = msg.chat.username
        const feedback = params[0]

        if (!feedback || feedback.length <= 0) {
            moduleBot.sendMessage(chat_id, helpText)
        }
        else {
            return api.storeFeedback(chat_id, username, feedback).then((result) => {
                moduleBot.sendMessage(chat_id, thanksText(result.shortLink))
            })
        }
    }
}

var helpText = "Got any comments? We'd love to hear those! You can send us your thoughts by simply typing them behind the /feedback command. For example: /feedback More signals!"
var thanksText = (feedbackCode) => `Thanks! Your feedback has been sent to the team and will be reviewed shortly. (Feedback code: ${feedbackCode})`
