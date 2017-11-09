
//! The notation for the callback_data is at max 64
//! I decided to use a <command>.<operation>:<param> to navigate through the menu and
//! perform operations. Example: settings.DB:<T_V> stores the value V in the table T

var storage = require('../db/storage').storage;
var errorManager = require('../util/error').errorManager;
var help = require('./help').help;
var kbs = require('./keyboards').keyboards;


var post = function (chat_id, optionals) {
    return storage.settingsQuery(chat_id, optionals)
        .then(userProfile => settings.profile = JSON.parse(userProfile))
        .then(() => {

            var isMuted = settings.profile.is_muted;
            var isSubscribed = settings.profile.is_subscribed;

            var msg = `Your profile is set on *${settings.profile.horizon}* horizon, *${settings.profile.risk}* risk.
You are ${isSubscribed ? '*subscribed*' : '*not subscribed*'} to signals and your notifications are ${isMuted ? '*muted*' : '*active*'}.
Tap below to edit your settings:`;

            kbs.main_keyboard.message = msg;

            // Dynamic Subscribe button
            kbs.main_keyboard.buttons[2][0].text = isSubscribed ? 'Unsubscribe' : 'Subscribe';
            kbs.main_keyboard.buttons[2][0].callback_data = isSubscribed
                ? kbs.main_keyboard.buttons[2][0].callback_data.split('_')[0] + '_False'
                : kbs.main_keyboard.buttons[2][0].callback_data.split('_')[0] + '_True';

            // Dynamic Alert button
            kbs.main_keyboard.buttons[3][0].text = isMuted ? 'Turn alerts ON' : 'Turn alerts OFF';
            kbs.main_keyboard.buttons[3][0].callback_data = isMuted
                ? kbs.main_keyboard.buttons[3][0].callback_data.split('_')[0] + '_False'
                : kbs.main_keyboard.buttons[3][0].callback_data.split('_')[0] + '_True';
        });
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
        label: 'CUR',
        kb: kbs.base_currency_keyboard
    }];

var settings = {
    text: kbs.main_keyboard.message,
    getKeyboard: function (label = 'MAIN') {
        var kb = keyboards.filter(function (keyboard) {
            return keyboard.label == label;
        });

        if (kb.length > 0)
            return kb[0];

        throw new Error('Keyboard not found');
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
            if (kv[0] == 'CUR')
                return post(chat_id, { base_currency: kv[1] });
            else
                return errorManager.reject('Something well wrong, please retry or contact us!', 'Invalid callback_data key');
        }
    },
    profile: {},
    getCurrent: (chat_id) => post(chat_id),
    subscribe: (chat_id, token) => post(chat_id, { is_subscribed: 'True', is_muted: 'False', token: token }),
    subscribedMessage: "You are now subscribed!I'll be providing you with trading signals whenever an interesting opportunity comes up." +
    "This might take some time. Here are some helpful commands you can try out in the meanwhile:\n\n" + help.command_list,
    subscriptionError: "Something went wrong with the subscription, please retry or contact us!",
    tokenError: "Your token is invalid or already activated. Please try again with /token _<your token>_, contact us or get a valid token (here)."
}

exports.settings = settings;