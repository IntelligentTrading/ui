var eventEmitter = require('../../events/botEmitter')
var api = require('../../core/api')
var moduleBot = null

eventEmitter.on('eula', (msg) => {
    if (moduleBot) sendEula(msg)
})

module.exports = function (bot) {
    moduleBot = bot

    this.cmd = async (msg, params) => {

        var existingUser = await api.getUser(msg.chat.id).catch((err) => {
            console.log(err)
            return null
        })
        if (!existingUser) {
            existingUser = await api.createUser(msg.chat.id, msg.chat.username).catch(err => { console.log(err) })
        }

        existingUser = JSON.parse(existingUser)
        if (!existingUser.eula)
            sendEula(msg)

        //cHJvbW9fSVRGMTAmZW1haWxfdGVzdEB5YWhvby5pdA
        var payload = Buffer.from(params[0], 'base64').toString()

        if (payload.startsWith('refcode_')) {
            var referral = payload.split('_')[1]
            return api.referral(msg.chat.id, referral).then(result => {
                moduleBot.sendMessage(msg.chat.id, result)
            }).catch(err => {
                moduleBot.sendMessage(msg.chat.id, err.error)
            })
        }

        if (payload.startsWith('promo_')) {
            var promoParam = payload.split('&')[0]
            var emailParam = payload.split('&')[1]
            var promo = promoParam.split('_')[1]
            var email = emailParam.split('_')[1]
            return api.promo(msg.chat.id, promo).then(result => {
                var message = result.success ? result.message : result.reason
                moduleBot.sendMessage(msg.chat.id, message)
                return api.updateUser(msg.chat.id, { email: email })
            }).catch(err => {
                moduleBot.sendMessage(msg.chat.id, err.error)
            })
        }
    }
}

function sendEula(msg) {
    const chat_id = msg.chat.id
    moduleBot.sendMessage(chat_id, getEulaText(chat_id), markdown_opts).then(() => {
        moduleBot.sendMessage(chat_id, 'Note: read the EULA to the bottom and click on the link to accept.')
    })
}

var markdown_opts = {
    parse_mode: "Markdown"
}

function getEulaText(chat_id) {
    var eula_endpoint = process.env.ITT_NODE_SERVICES.split('://')[1]
    var rhash;

    if (eula_endpoint.indexOf('prod') >= 0) {
        rhash = 'ab3fccf4149007';
    }
    else if (eula_endpoint.indexOf('beta') >= 0) {
        rhash = '38e694f259517c';
    }
    else {
        rhash = '5c2b438a5803ac'
    }

    return `Hi! I'm the ITF Trading Bot. Before you activate your account [you MUST accept the End User Licensing Agreement.](https://t.me/iv?url=https%3A%2F%2F${eula_endpoint}%2Feula%3Fu%3D${chat_id}&rhash=${rhash}).`
}