var api = require('../../core/api')
require('../../util/extensions')
var dateUtils = require('../../util/dates')
var nopreview_markdown_opts = require('../../bot/telegramInstance').nopreview_markdown_opts

var moduleBot = null
var paidSignalMsgFeaturesMessage = `With paid you will get:

‣ 3 trading profiles to choose from (short, medium, long)
‣ Upside and Downside alerts
‣ RSI proprietary signals
‣ Movement alerts on BTC and USDT
‣ More exchanges (Poloniex, Binance, Bittrex)`

var upgradeToStarter = 'Upgrade to the Starter plan by sending'
var extendYourSubscription = (daysLeft) => { return `Your subscription will expire in ${daysLeft} days.\nTo extend your subscription send` }

var getCurrentStatusMessage = (settings, itt_usd_rate) => {
    var betaDaysLeft = dateUtils.getDaysLeftFrom(settings.subscriptions.beta)
    var paidDaysLeft = dateUtils.getDaysLeftFrom(settings.subscriptions.paid)
    var currentPlan = paidDaysLeft > 0 ? 'Starter' : (betaDaysLeft > 0 ? 'FREE+' : 'FREE')

    return `You are currently subscribed to the *${currentPlan}* plan. View all available subscription plans [here](intelligenttrading.org/pricing).

${paidDaysLeft <= 0 ? upgradeToStarter : extendYourSubscription(paidDaysLeft)} ITT tokens to the address below. You will be notified as soon as the transaction is confirmed.

‣ Receiver address: ${settings.ittWalletReceiverAddress}
‣ ITT/USDT rate: ${itt_usd_rate}
‣ ITT available on the following exchanges: Coss.io, [Mercatox](https://mercatox.com/), [Idex](https://idex.market/), [ForkDelta](https://forkdelta.github.io/)`
}

module.exports = function (bot) {
    moduleBot = bot

    this.cmd = (msg, params) => {
        const chat_id = msg.chat.id
        Promise.all([api.getUsers({ telegram_chat_id: chat_id }), getITTRate()]).then(fulfillments => {
            var user = JSON.parse(fulfillments[0])
            var itt_usd_rate = fulfillments[1]
            var currentStatusMsg = getCurrentStatusMessage(user.settings, itt_usd_rate)
            return currentStatusMsg
        }).then((msg) => {
            moduleBot.sendMessage(chat_id, msg, nopreview_markdown_opts)
        })
    }
}

var getITTRate = () => {
    return api.getITT().then(itt_json => {
        var itt = JSON.parse(itt_json)
        return parseFloat(itt.close).toFixed(3)
    })
}

