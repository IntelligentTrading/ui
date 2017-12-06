
//! The notation for the callback_data is at max 64
//! I decided to use a <command>.<operation>:<param> to navigate through the menu and
//! perform operations. Example: settings.DB:<T_V> stores the value V in the table T

var api = require('../core/api').api;
var errorManager = require('../util/error').errorManager;
var help = require('./help').help;
var kbs = require('./keyboards/keyboards').keyboards;

var current_kb = kbs.main_keyboard;

var post = function (chat_id, optionals) {
    return api.user(chat_id, optionals)
        .then(response => {
            if (response.statusCode == 200) {
                settings.profile = JSON.parse(response.body);

                //update all the kbs at once
                kbs.updateKeyboardsSettings(settings.profile);
                return settings.profile;
            }
            else {
                throw new Error(response.statusMessage);
            }
        })
        .catch((reason) => {
            console.log(reason);
            throw new Error(errorManager.genericErrorMessage);
        })
}

var keyboards = [
    {
        label: 'MAIN',
        kb: kbs.main_keyboard
    },
    {
        label: 'RSK',
        kb: kbs.risk_keyboard
    },
    {
        label: 'HRZ',
        kb: kbs.trader_keyboard
    },
    {
        label: 'SIG',
        kb: kbs.base_currency_keyboard
    },
    {
        label: 'COI',
        kb: kbs.coins_keyboard
    }];

var settings = {
    text: kbs.main_keyboard.message,
    getKeyboard: function (label = 'MAIN') {
        var kb = keyboards.filter(function (keyboard) {
            return keyboard.label == label;
        });

        if (kb.length > 0) {
            current_kb = kb[0].kb;
        }
        return current_kb;

        throw new Error('Keyboard not found');
    },
    getCurrentKeyboard: () => {
        return current_kb;
    },
    store: (chat_id, param) => {
        if (param != undefined) {
            let kv = param.split('_');

            if (kv[0] == 'HRZ')
                return post(chat_id, { horizon: kv[1] });
            if (kv[0] == 'RSK')
                return post(chat_id, { risk: kv[1] });
            if (kv[0] == 'ISMUTED')
                return post(chat_id, { is_muted: kv[1] });
            if (kv[0] == 'ISSUB')
                return post(chat_id, { is_subscribed: kv[1] });
            if (kv[0] == 'SIG') {
                var quota_currency = { name: kv[1], follow: kv[2] };
                var quota_currencies = [];
                quota_currencies.push(quota_currency);
                return post(chat_id, { quota_currencies: quota_currencies });
            }
            if (kv[0] == 'COI') {
                var coin = { name: kv[1], follow: kv[2] };
                var altcoins_array = [];
                altcoins_array.push(coin);
                return post(chat_id, { altcoins: altcoins_array });
            }
            if (kv[0] == 'EULA')
                return post(chat_id, { eula: kv[1] });
            else
                return errorManager.reject('Something well wrong, please retry or contact us!', 'Invalid callback_data key');
        }
    },
    profile: {},
    getCurrent: (chat_id) => post(chat_id),
    subscribe: (chat_id, token) => post(chat_id, { is_subscribed: 'True', is_muted: 'False', token: token, horizon: 'medium', risk: 'medium' }),
    subscribedMessage: "You are now subscribed!I'll be providing you with trading signals whenever an interesting opportunity comes up." +
        "This might take some time. Here are some helpful commands you can try out in the meanwhile:\n\n" + help.command_list,
    teamMemberSubscription: "You are now subscribed as ITT Team Member!",
    subscriptionError: "Something went wrong with the subscription, please retry or contact us!",
    tokenError: "Your token is invalid or already in use. Please /token _your token_, contact us or [join](https://goo.gl/forms/T7fFe38AM8mNRhDO2) the waiting list."
}

exports.settings = settings;