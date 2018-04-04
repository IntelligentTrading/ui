var api = require('../../core/api')
var eventEmitter = require('../../events/botEmitter')

var moduleBot = null
module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => {

        api.users({ telegram_chat_id: msg.chat.id }).then((userJSON) => {
            var user = JSON.parse(userJSON)
            if (!user.eula) eventEmitter.emit('eula', msg)
            else eventEmitter.emit('ShowSettingsKeyboard', user)
        })
    }

    this.callback = (callback_message) => {

        var message_id = callback_message.message.message_id
        var chat_id = callback_message.message.chat.id
        var callback_data = JSON.parse(callback_message.data)

        var data_wrapper = { data: null, url: '' }
        if (callback_data.f)
            data_wrapper = this[callback_data.f](callback_data.data)
        else
            data_wrapper.data = callback_data.data

        var destination_page = callback_data.n

        api.updateUser(chat_id, data_wrapper.data, data_wrapper.url)
            .then(updatedUser => {
                return moduleBot.answerCallbackQuery({ callback_query_id: callback_message.id, text: 'Settings saved!' })
                    .then(() => { return updatedUser })
            })
            .then((updatedUser) => {
                eventEmitter.emit(`${destination_page}KeyboardChanged`, chat_id, message_id, JSON.parse(updatedUser).settings)
            })
            .catch(err => moduleBot.sendMessage(chat_id, err))
    }

    this.counter = (data) => {
        var counter_currencies = [];
        counter_currencies.push(data);
        return { data: { currencies: counter_currencies }, url: 'currencies/counter' }
    }

    this.transaction = (data) => {
        var transaction_currencies = []
        transaction_currencies.push(data)
        return { data: { currencies: transaction_currencies }, url: 'currencies/transaction' }
    }
}