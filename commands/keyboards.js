var keyboards = {

    main_keyboard: {
        message: '',
        buttons:
        [
            [{ text: "Edit Risk Profile", callback_data: "settings.NAV:RSK" }],
            [{ text: "Edit Trader Profile", callback_data: "settings.NAV:HRZ" }],
            [{ text: "Subscribe", callback_data: "settings.DB:ISSUB_" }],
            [{ text: "Turn alerts", callback_data: "settings.DB:ISMUTED_" }],
            [{ text: "Change base currency", callback_data: "settings.NAV:CUR" }]
        ]
    },
    risk_keyboard: {
        message: "Please select which _risk profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your trader profile.",
        buttons: [
            [{ text: "Only the safest trade signals (Beginners)", callback_data: "settings.DB:RSK_low" }],
            [{ text: "Any signal, reputable coins only (Standard)", callback_data: "settings.DB:RSK_medium" }],
            [{ text: "Any signal, including low value coins (High risk high reward)", callback_data: "settings.DB:RSK_high" }],
            [{ text: "Cancel", callback_data: "settings.NAV:MAIN" }]
        ]
    },
    trader_keyboard: {
        message: "Please select which _trader profile_ suits you best.\nI will adjust your signals accordingly in conjunction with your risk profile.",
        buttons: [
            [{ text: "Investor: Long term trade signals. Exit and entry points for HODL. (Low risk)", callback_data: "settings.DB:HRZ_long" }],
            [{ text: "Swingtrader: Short/near term trade signals. Profit from volatility. (Medium risk)", callback_data: "settings.DB:HRZ_medium" }],
            [{ text: "Daytrader: Very short term trade signals. Getting in and out trades. (High risk)", callback_data: "settings.DB:HRZ_short" }],
            [{ text: "Cancel", callback_data: "settings.NAV:MAIN" }]
        ]
    },
    base_currency_keyboard: {
        message: "Please select a _currency_ as base of your rate informations.",
        buttons: [
            [{ text: "Bitcoin", callback_data: "settings.DB:CUR_BTC" },
            { text: "US Dollar", callback_data: "settings.DB:CUR_USD" }]
        ]
    }
}


exports.keyboards = keyboards;