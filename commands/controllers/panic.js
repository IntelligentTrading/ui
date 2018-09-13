var api = require('../../core/api')
var eventEmitter = require('../../events/botEmitter')
var sentimentUtil = require('../../util/sentiment')

var moduleBot = null
module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => { }

    this.callback = (callback_message) => {
        var message_id = callback_message.message.message_id
        var chat_id = callback_message.message.chat.id

        var callback_data = JSON.parse(callback_message.data)

        api.addFeedReaction(callback_data.d.fid, callback_data.d.r, chat_id).then(updatedFeed => {
            var updatedText = sentimentUtil.messageTemplate(updatedFeed, callback_message.message);
            bot.answerCallbackQuery({ callback_query_id: callback_message.id, text: 'Reaction saved!' })
                .then(res => {
                    bot.editMessageText(updatedText,
                        {
                            chat_id: chat_id,
                            message_id: message_id,
                            parse_mode: 'Markdown',
                            disable_web_page_preview: true
                        })
                })
        })
    }
}