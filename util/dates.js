module.exports.getDaysLeftFrom = (expirationDate) => {
    // Discard the time and time-zone information.
    var _MS_PER_DAY = 1000 * 60 * 60 * 24
    var now = new Date()
    var utc1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    var expDate = new Date(expirationDate)
    var utc2 = Date.UTC(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());

    return ((utc2 - utc1) / _MS_PER_DAY).toFixed(1)
}