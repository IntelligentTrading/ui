const fs = require('fs')
var api = require('../core/api')
var errorManager = require('../util/error')
var dateUtil = require('../util/dates')
var _ = require('lodash')
var signalHelper = require('../util/signal-helper')

const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: false })
const telegram_message_options = {
    parse_mode: "Markdown"
}

var horizons = ['long', 'medium', 'short']
var subscriptionTemplates = {}
initSubscriptionTemplates()

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

                        var filters = [buildHorizonFilter(horizon)]

                        return api.getUsers({ filters: filters }).then(usersJson => {
                            var users = JSON.parse(usersJson)

                            users = users.filter(user => user.is_ITT_team || user.eula)

                            var signalForNonno = isForNonno(signal, message_data)
                            var signalForFree = isForFree(signal, message_data)
                            var signalForTier = isForTier(signal, message_data)

                            var matchingTierUsers = users.filter(user => (user.settings.is_ITT_team || dateUtil.getDaysLeftFrom(user.settings.subscriptions.paid) > 0) &&
                                user.settings.transaction_currencies.indexOf(message_data.transaction_currency) >= 0 &&
                                user.settings.counter_currencies.indexOf(parseInt(message_data.counter_currency)) >= 0 &&
                                !user.settings.is_muted
                            )

                            var matchingBetaUsers = users.filter(user => dateUtil.getDaysLeftFrom(user.settings.subscriptions.beta) > 0 &&
                                user.settings.transaction_currencies.indexOf(message_data.transaction_currency) >= 0 &&
                                user.settings.counter_currencies.indexOf(parseInt(message_data.counter_currency)) >= 0 &&
                                !user.settings.is_muted
                            )

                            var freeOnlyUsers = users.filter(user => (
                                !user.settings.is_ITT_team &&
                                dateUtil.getDaysLeftFrom(user.settings.subscriptions.paid) <= 0 &&
                                dateUtil.getDaysLeftFrom(user.settings.subscriptions.beta) <= 0))

                            var subscribers = []

                            if (signalForFree) {
                                subscribers = freeOnlyUsers
                                subscribers = subscribers.concat(matchingBetaUsers)
                            }
                            else if (signalForNonno) {
                                subscribers = subscribers.concat(matchingBetaUsers)
                            }

                            if (signalForTier)
                                subscribers = _.unionBy(subscribers, matchingTierUsers, 'telegram_chat_id')

                            var rejections = []
                            var notificationPromises = []

                            subscribers.map(subscriber => {
                                var notificationPromise = bot.sendMessage(subscriber.telegram_chat_id, telegram_signal_message, opts)
                                    .catch(err => {
                                        rejections.push(subscriber.telegram_chat_id)
                                        console.log(`${err.message} :: chat ${subscriber.telegram_chat_id}`)
                                    })

                                notificationPromises.push(notificationPromise)
                            })

                            return Promise.all(notificationPromises)
                                .then(() => {
                                    return { signal_id: message_data.id, rejections: rejections }
                                })
                        })
                    }
                })
            })
    }
}

function isForFree(signal, message_data) {

    var isUptrend = message_data.trend > 0
    var isUSDT = message_data.counter_currency == 2

    return IsDeliverableTo('free', signal, message_data) && isUptrend && isUSDT
}

function isForNonno(signal, message_data) {
    return IsDeliverableTo('beta', signal, message_data)
}

function isForTier(signal, message_data) {
    return IsDeliverableTo('paid', signal, message_data)
}

function IsDeliverableTo(pricingPlan, signal, message_data) {

    var template = subscriptionTemplates[pricingPlan]
    var isSubscribedToTickers = template.tickers.length == 0 || template.tickers.indexOf(message_data.transaction_currency) >= 0
    var canDeliverToLevel = signal.deliverTo.indexOf(pricingPlan) >= 0
    var hasTheRightHorizon = !template.horizon || horizons.indexOf(message_data.horizon) <= horizons.indexOf(template.horizon)
    var isAllowedExchange = !template.exchanges || template.exchanges.length <= 0 || template.exchanges.indexOf(message_data.source.toLowerCase()) >= 0
    return isSubscribedToTickers && canDeliverToLevel && hasTheRightHorizon && isAllowedExchange
}

var buildHorizonFilter = (horizon) => {
    return `horizon=${horizons.slice(horizons.indexOf(horizon)).join(',')}`;
}

function initSubscriptionTemplates() {
    var freePromise = api.getSubscriptionTemplate('free')
    var nonnoPromise = api.getSubscriptionTemplate('beta')
    var tierPromise = api.getSubscriptionTemplate('paid')

    Promise.all([freePromise, nonnoPromise, tierPromise]).then(templates => {
        subscriptionTemplates.free = JSON.parse(templates[0])
        subscriptionTemplates.beta = JSON.parse(templates[1])
        subscriptionTemplates.paid = JSON.parse(templates[2])
    })
}

module.exports = { notify: notify }