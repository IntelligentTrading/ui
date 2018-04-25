var rp = require('request-promise')
var _ = require('lodash')
var api = require('../core/api')
var NodeCache = require('node-cache')
var cache = new NodeCache({ stdTTL: 6000, checkperiod: 6000 })

var tickers = {
    get: () => {
        var tickers = cache.get('tickers');
        if (tickers != undefined) { return Promise.resolve(tickers) }
        else return loadTickers()
    },
    counter_currencies: () => {
        var counter_currencies = cache.get('counter_currencies');
        if (counter_currencies != undefined) { return Promise.resolve(counter_currencies) }
        else return loadCounterCurrencies()

    },
    init: () => {
        return Promise.all([tickers.get(), tickers.counter_currencies()])
    }
}

module.exports = tickers

var loadCounterCurrencies = async () => {
    var json_ccs = await api.counterCurrencies()
    var ccs = JSON.parse(json_ccs)
    cache.set('counter_currencies', ccs)
    return ccs
}

var loadTickers = async () => {
    var json_tickers = await api.tickers()
    var tickers = JSON.parse(json_tickers)
    cache.set('tickers', tickers)
    return tickers
}
