var eventEmitter = require('../../events/botEmitter')
var api = require('../../core/api')
var moduleBot = null

eventEmitter.on('eula', (msg) => {
    if (moduleBot) sendEula(msg)
})

module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => {
        api.createUser(msg.chat.id)
            .catch(err => { console.log(err) })
            .finally(() => sendEula(msg))
    }
}

function sendEula(msg) {
    const chat_id = msg.chat.id
    moduleBot.sendMessage(chat_id, getEulaText(chat_id), markdown_opts)
}

var markdown_opts = {
    parse_mode: "Markdown"
}

function getEulaText(chat_id) {
    var eula_endpoint = process.env.ITT_NODE_SERVICES.split('://')[1]
    var rhash;

    if (eula_endpoint.indexOf('prod') >= 0) {
        rhash = '47f5ff678046c3';
    }
    else if (eula_endpoint.indexOf('beta') >= 0) {
        rhash = '38e694f259517c';
    }
    else {
        rhash = '69471435748184'
    }

    return `Hi! I'm the ITF Trading Bot. Before you activate your account [you MUST accept the End User Licensing Agreement.](https://t.me/iv?url=https%3A%2F%2F${eula_endpoint}%2Feula%3Fu%3D${chat_id}&rhash=${rhash}).\nNote: read to the bottom and accept.`
}