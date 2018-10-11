var moment = require('moment')

var dateUtil = {
    getDaysLeftFrom: (expirationDate) => {
        // Discard the time and time-zone information.
        var _MS_PER_DAY = 1000 * 60 * 60 * 24
        var now = new Date()
        var utc1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
        var expDate = new Date(expirationDate)
        var utc2 = Date.UTC(expDate.getFullYear(), expDate.getMonth(), expDate.getDate(), expDate.getHours())

        return ((utc2 - utc1) / _MS_PER_DAY).toFixed(2)
    },
    hasValidSubscription: (settings) => {

        var isStakeHolder = settings.staking && settings.staking.diecimila

        return dateUtil.getDaysLeftFrom(settings.subscriptions.paid) > 0 ||
            dateUtil.getDaysLeftFrom(settings.subscriptions.beta) > 0 ||
            settings.is_ITT_team ||
            isStakeHolder
    },
    getHighestSubscriptionLevel: (settings) => {

        var levels = {}
        levels.is_ITT_team = settings.is_ITT_team
        levels.isAdvanced = settings.staking && settings.staking.centomila
        levels.isPro = settings.staking && settings.staking.diecimila
        levels.isStarter = -1 * moment().diff(settings.subscriptions.paid, "hours") > 0
        levels.isFreePlus = -1 * moment().diff(settings.subscriptions.beta, "hours") > 0

        var highestLevel = 'free'
        if (levels.is_ITT_team) highestLevel = 'ITT'
        else if (levels.isAdvanced) highestLevel = 'centomila'
        else if (levels.isPro) highestLevel = 'diecimila'
        else if (levels.isStarter) highestLevel = 'paid'
        else if (levels.isFreePlus) highestLevel = 'beta'
        return highestLevel
    }
}

module.exports = dateUtil