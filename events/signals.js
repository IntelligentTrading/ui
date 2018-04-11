const fs = require('fs')
var api = require('../core/api')
var errorManager = require('../util/error')
var dateUtil = require('../util/dates')
var _ = require('lodash')
const request = require('request')
var signalHelper = require('../util/signal-helper')

const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: false })
const telegram_message_options = {
    parse_mode: "Markdown"
}

var horizons = ['long', 'medium', 'short']

function notify(message_data) {

    var opts =
        {
            "parse_mode": "Markdown",
            "disable_web_page_preview": "true"
        };

    if (message_data != undefined) {
        var risk = message_data.risk;
        var horizon = message_data.horizon;
        var signal_counter_currency

        console.log(`${message_data.signal} signal`);

        return signalHelper.applyTemplate(message_data)
            .then(telegram_signal_message => {
                if (!telegram_signal_message) throw new Error(errorManager.generic_error_message)

                return api.getSignals(message_data.signal).then(signalsJson => {
                    if (signalsJson) {
                        var signal = JSON.parse(signalsJson)[0]
                        signal.trend = message_data.trend
                        signal.source = message_data.source

                        var filters = [buildHorizonFilter(horizon),
                        `transaction_currencies=${message_data.transaction_currency}`,
                        `counter_currencies=${message_data.counter_currency}`, 'is_muted=false']

                        var getFreeUsersPromise = getFreeUsers(signal, message_data)
                        var getUsersPromise = api.getUsers({ filters: filters })

                        Promise.all([getFreeUsersPromise, getUsersPromise]).then(fulfillments => {

                            var freeUsers = fulfillments[0] ? JSON.parse(fulfillments[0]) : []
                            var users = JSON.parse(fulfillments[1])

                            var mergedUsers = _.uniqBy(users.concat(freeUsers), 'telegram_chat_id')

                            mergedUsers.filter(user => user.eula && (IsSubscribed(user, signal) || user.is_ITT_team))
                                .map(subscribedUser => {

                                    bot.sendMessage(subscribedUser.telegram_chat_id, telegram_signal_message, opts).catch(err => {
                                        console.log(`${err.message} :: chat ${subscribedUser.telegram_chat_id}`)
                                    })
                                })
                        })
                    }
                })
            })
    }
}

function getFreeUsers(signal, message_data) {
    return isForFreeUsers(signal, message_data).then(itIs => {
        if (itIs) return api.getFreeUsers()
    })
}

function isForFreeUsers(signal, message_data) {
    return api.getSubscriptionTemplate('free').then(templateJson => {
        var template = JSON.parse(templateJson)
        var isFreeTicker = template.tickers.indexOf(message_data.transaction_currency) >= 0
        var isUSDT = message_data.counter_currency == 2
        var isFreeLevel = signal.deliverTo.indexOf('free') >= 0
        var isUptrend = message_data.trend > 0
        var isMediumLongHorizon = horizons.indexOf(message_data.horizon) <= horizons.indexOf(template.horizon)
        var isAllowedExchange = template.exchanges.indexOf(message_data.source.toLowerCase()) >= 0
        return isFreeTicker && isUSDT && isFreeLevel && isUptrend && isMediumLongHorizon && isAllowedExchange
    })
}

function IsSubscribed(user, signal) {
    var isSubscribed = false
    signal.deliverTo.forEach(level => {
        var userLevelExpirationDate = user.settings.subscriptions[level]
        isSubscribed = isSubscribed ||
            (userLevelExpirationDate && dateUtil.getDaysLeftFrom(userLevelExpirationDate) > 0 &&
                (level != 'free' || level == 'free' && signal.trend > 0 && signal.source.toLowerCase() == 'poloniex'))
    })
    return isSubscribed
}

var buildHorizonFilter = (horizon) => {
    return `horizon=${horizons.slice(horizons.indexOf(horizon)).join(',')}`;
}

module.exports = { notify: notify }