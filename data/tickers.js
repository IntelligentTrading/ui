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
        .then(() => console.log('OK'))
        .catch(err => console.log(err))
    }
}

module.exports = tickers

var loadCounterCurrencies = () => {
    return api.counterCurrencies().then(json_ccs => {
        var ccs = JSON.parse(json_ccs)
        cache.set('counter_currencies', ccs)
        console.log('Counter currencies cache set.')
        return ccs
    }).catch(err => console.log(err))
}

var loadTickers = () => {
    return api.tickers().then(json_tickers => {
        var tickers = JSON.parse(json_tickers)
        cache.set('tickers', tickers)
        console.log('Transaction currencies cache set')
        return tickers
    }).catch(err => console.log(err))
}
