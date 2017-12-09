var rp = require('request-promise');
var _ = require('lodash');
var api = require('../../core/api').api;
var NodeCache = require('node-cache');
var cache = new NodeCache({ stdTTL: 6000, checkperiod: 6000 });


var tickers = {
    get: () => {

        var tickers = cache.get('tickers');
        if (tickers != undefined) {
            return new Promise((resolve, reject) => {
                resolve(tickers);
            });
        }

        return api.tickersInfo()
            .then((json_tickers) => {
                var tickersContainer = JSON.parse(json_tickers);
                cache.set('tickers', tickersContainer.tickers);
                return tickersContainer.tickers;
            })
            .catch((reason) => {
                console.log(reason)
            });
    }
}

exports.tickers = tickers;