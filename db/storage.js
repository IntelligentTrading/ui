var request = require('request');

var api_url = `https://${process.env.ITT_API_HOST}`;

var storage = {
    saveSettings: (chat_id, is_subscribed = true, is_muted = false, risk = RISK.LOW, horizon = HORIZON.SHORT) =>
        new Promise((resolve, reject) => {

            request.post({
                url: `${api_url}/user`,
                form: {
                    chat_id: chat_id,
                    is_subscribed: is_subscribed,
                    is_muted: is_muted,
                    risk: risk,
                    horizon: horizon
                }
            }, function (error, response, body) {
                if (response != null && response.statusCode == 200) {
                    resolve('Ok');
                }
                else {
                    reject(`${response.statusCode}:${response.statusMessage}\n${body}`);
                }
            });
        })
}


var RISK = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH'
}

var HORIZON = {
    SHORT: 'SHORT',
    MEDIUM: 'MEDIUM',
    LONG: 'LONG'
}

exports.storage = storage;