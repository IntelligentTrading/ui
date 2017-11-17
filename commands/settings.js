
//! The notation for the callback_data is at max 64
//! I decided to use a <command>.<operation>:<param> to navigate through the menu and
//! perform operations. Example: settings.DB:<T_V> stores the value V in the table T

var api = require('../core/api').api;
var errorManager = require('../util/error').errorManager;
var help = require('./help').help;

var main_keyboard = {
    message: '',
    buttons:
        [
            [{ text: "Subscribe", callback_data: "settings.DB:ISSUB_" }],
            [{ text: "Turn alerts", callback_data: "settings.DB:ISMUTED_" }]
        ]
}

var risk_keyboard = {
    message: "Please select which _risk profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your trader profile.",
    buttons: [
        [{ text: "Only the safest trade signals (Beginners)", callback_data: "settings.DB:RSK_low" }],
        [{ text: "Any signal, reputable coins only (Standard)", callback_data: "settings.DB:RSK_medium" }],
        [{ text: "Any signal, including low value coins (High risk high reward)", callback_data: "settings.DB:RSK_high" }],
        [{ text: "Cancel", callback_data: "settings.NAV:MAIN" }]
    ]
};

var trader_keyboard = {
    message: "Please select which _trader profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your risk profile.",
    buttons: [
        [{ text: "Investor: Long term trade signals. Exit and entry points for HODL. (Low risk)", callback_data: "settings.DB:HRZ_long" }],
        [{ text: "Swingtrader: Short/near term trade signals. Profit from volatility. (Medium risk)", callback_data: "settings.DB:HRZ_medium" }],
        [{ text: "Daytrader: Very short term trade signals. Getting in and out trades. (High risk)", callback_data: "settings.DB:HRZ_short" }],
        [{ text: "Cancel", callback_data: "settings.NAV:MAIN" }]
    ]
};

var post = function (chat_id, optionals) {
    return api.user(chat_id, optionals)
        .then(response => {
            if (response.statusCode == 200) {
                settings.profile = JSON.parse(response.body);
                updateKbMessages();
                return settings.profile;
            }
            else {
                throw new Error(response.statusMessage);
            }
        })
}


function updateKbMessages() {
    var isMuted = settings.profile.is_muted;
    var isSubscribed = settings.profile.is_subscribed;

    var msg = `Your profile is set on *${settings.profile.horizon}* horizon, *${settings.profile.risk}* risk.
You are ${isSubscribed ? '*subscribed*' : '*not subscribed*'} to signals and your notifications are ${isMuted ? '*muted*' : '*active*'}.
Tap below to edit your settings:`;

    main_keyboard.message = msg;

    // Dynamic Subscribe button
    main_keyboard.buttons[0][0].text = isSubscribed ? 'Unsubscribe' : 'Subscribe';
    main_keyboard.buttons[0][0].callback_data = isSubscribed
        ? main_keyboard.buttons[0][0].callback_data.split('_')[0] + '_False'
        : main_keyboard.buttons[0][0].callback_data.split('_')[0] + '_True';

    // Dynamic Alert button
    main_keyboard.buttons[1][0].text = isMuted ? 'Turn alerts ON' : 'Turn alerts OFF';
    main_keyboard.buttons[1][0].callback_data = isMuted
        ? main_keyboard.buttons[1][0].callback_data.split('_')[0] + '_False'
        : main_keyboard.buttons[1][0].callback_data.split('_')[0] + '_True';

    //! let's keep some features private
    console.log(settings.profile);
    console.log(main_keyboard.buttons.length);

    if (settings.profile.is_ITT_team == true && main_keyboard.buttons.length < 4) {
        console.log('Adding advanced button config');
        main_keyboard.buttons.push([{ text: "Edit Risk Profile", callback_data: "settings.NAV:RSK" }]);
        main_keyboard.buttons.push([{ text: "Edit Trader Profile", callback_data: "settings.NAV:HRZ" }]);
    }
}

var keyboards = [
    {
        label: 'MAIN',
        kb: main_keyboard
    },
    {
        label: 'RSK',
        kb: risk_keyboard
    },
    {
        label: 'HRZ',
        kb: trader_keyboard
    }];

var settings = {
    text: main_keyboard.message,
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
    tokenError: "Your token is invalid or already in use. Please contact us or [join](https://goo.gl/forms/T7fFe38AM8mNRhDO2) the waiting list."
}

exports.settings = settings;