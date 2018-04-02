var api = require('../../core/api')

/**
 * use the callback data-> f:label for the current function n:label for the function to exec on callback (next)
 */
var moduleBot = null
module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => { setTraderProfile(msg.chat.id) };
    this.callback = (callback_message) => {
        var message_id = callback_message.message.message_id
        var chat_id = callback_message.message.chat.id

        var callback_data = JSON.parse(callback_message.data)

        store(chat_id, callback_data.data)
            .then(() => {
                this[callback_data.n](chat_id, message_id)
            })
            .catch(err => error(chat_id, err))
    };
    this.hrz = (chat_id) => setTraderProfile(chat_id);
    this.sigall = (chat_id, msg_id) => setTransactionCurrencies(chat_id, msg_id);
    this.crowd = (chat_id, msg_id) => setCrowdSentiment(chat_id, msg_id);
    this.end = (chat_id, msg_id) => wizardEnd(chat_id, msg_id);
    this.nevermind = (chat_id) => moduleBot.sendMessage(chat_id, 'Okay! You can always configure your /settings later! Signals will come soon!')
}

function setTraderProfile(chat_id) {
    var text = "💡*Pick your profile* (Step 1/3)\nFirst, let's set up your trading profile. These profiles use 1hr, 4hr & 1D periods respectively. High risk means lots of alerts!"

    var horizon_btns = [{
        "text": "High Risk",
        "callback_data": JSON.stringify({ cmd: "wizard", n: "sigall", data: { horizon: "short" } })
    },
    {
        "text": "Medium Risk",
        "callback_data": JSON.stringify({ cmd: "wizard", n: "sigall", data: { horizon: "medium" } })
    },
    {
        "text": "Low Risk",
        "callback_data": JSON.stringify({ cmd: "wizard", n: "sigall", data: { horizon: "long" } })
    }];

    var opts =
        {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [horizon_btns] }
        }

    moduleBot.sendMessage(chat_id, text, opts);
}

//Step 2
function setTransactionCurrencies(chat_id, msg_id) {

    var text = "💡*Enable all altcoins* (Step 2/3)\nGreat! We suggest enabling all altcoins at first. You can always change it later manually."
    var sigall_btns = [{
        "text": "Enable all",
        "callback_data": JSON.stringify({ cmd: "wizard", n: "crowd", data: { sigall: true } })
    },
    {
        "text": "No thanks",
        "callback_data": JSON.stringify({ cmd: "wizard", n: "crowd", data: { sigall: false } })
    }]

    moduleBot.editMessageText(text,
        {
            chat_id: chat_id,
            message_id: msg_id,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            reply_markup: { inline_keyboard: [sigall_btns] }
        })
}

//Step 3
function setCrowdSentiment(chat_id, msg_id) {

    var text = "💡*Enable sentiment alerts* (Step 3/3)\nLast step! We offer Crowd Sentiment alerts, they tell you what's going on in the market. Would you like us to enable them?"
    var crowd_btns = [{
        "text": "Turn On",
        "callback_data": JSON.stringify({ cmd: "wizard", n: "end", data: { crowd: true } })
    },
    {
        "text": "Turn Off",
        "callback_data": JSON.stringify({ cmd: "wizard", n: "end", data: { crowd: false } })
    }]

    moduleBot.editMessageText(text,
        {
            chat_id: chat_id,
            message_id: msg_id,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            reply_markup: { inline_keyboard: [crowd_btns] }
        })
}

function wizardEnd(chat_id, msg_id) {
    moduleBot.deleteMessage(chat_id, msg_id)
        .then(() => { moduleBot.sendMessage(chat_id, 'Thanks for your help! Please keep in mind it could take a while before alerts come in!') })
}

var store = (chat_id, data) => {

    if (!data) return Promise.resolve()

    if (data.horizon) {
        return api.updateUser(chat_id, { horizon: data.horizon })
    }
    if (data.hasOwnProperty('sigall') && data.sigall) {
        return api.selectAllSignals(chat_id)
    }
    if (data.hasOwnProperty('crowd')) {
        return api.updateUser(chat_id, { is_crowd_enabled: data.crowd })
    }

    return Promise.resolve()
    //error(chat_id, '[Wizard]: wrong callback data')
}

var error = (chat_id, reason) => {
    console.log(reason)
    return moduleBot.sendMessage(chat_id, 'Something went wrong with the wizard');
}