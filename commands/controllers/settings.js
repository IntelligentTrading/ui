var api = require('../../core/api')
var eventEmitter = require('../../events/botEmitter')

var moduleBot = null
module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => {

        api.getUsers({ telegram_chat_id: msg.chat.id }).then((userJSON) => {
            var user = JSON.parse(userJSON)
            if (!user.eula) eventEmitter.emit('eula', msg)
            else eventEmitter.emit('ShowSettingsKeyboard', user)
        })
    }

    this.callback = (callback_message) => {

        var message_id = callback_message.message.message_id
        var chat_id = callback_message.message.chat.id
        var callback_data = JSON.parse(callback_message.data)

        var data = callback_data.d
        var destination_page = callback_data.n
        var url = ''

        if (callback_data.d.sym || callback_data.d.idx != null) {

            var counter_currencies = [];
            counter_currencies.push({
                symbol: callback_data.d.sym,
                follow: callback_data.d.in,
                index: callback_data.d.idx
            })
            data = { currencies: counter_currencies }
            url = callback_data.d.sym ? 'currencies/transaction' : 'currencies/counter'
        }

        api.updateUser(chat_id, data, url).then(updatedUser => {
            return moduleBot.answerCallbackQuery({ callback_query_id: callback_message.id, text: 'Settings saved!' })
                .then(() => { return updatedUser })
        }).then((updatedUser) => {
            var navigateToKeyboard = destination_page.split('(')[0]
            var navigateToPage = destination_page.split('(')[1]
            if (navigateToPage) navigateToPage = navigateToPage.replace(')', '')
            eventEmitter.emit(`${navigateToKeyboard}KeyboardChanged`, chat_id, message_id, JSON.parse(updatedUser).settings, navigateToPage)
        }).catch(reason => {
            var message = reason.error ? reason.error : reason
            moduleBot.sendMessage(chat_id, message)
        })
    }
}

counter = (data) => {
    var counter_currencies = [];
    counter_currencies.push(data);
    return { currencies: counter_currencies }
}

transaction = (data) => {
    var transaction_currencies = []
    transaction_currencies.push(data)
    return { currencies: transaction_currencies }
}