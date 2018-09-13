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
    }
}

module.exports = dateUtil