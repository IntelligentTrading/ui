var api = require('../core/api').api;


function Wizard(bot) {
    this.bot = bot;

    //Step 1
    this.setTraderProfile = (chat_id) => {
        var text = "💡*Hint*\nAs first step, we will set your trading profile. What kind of horizon would you like to set? The shorter the horizon, the more frequent will be the signals!"
        var horizon_btns = [{
            "text": "Short",
            "callback_data": "wizard.DB:HRZ_short"
        },
        {
            "text": "Medium",
            "callback_data": "wizard.DB:HRZ_medium"
        },
        {
            "text": "Long",
            "callback_data": "wizard.DB:HRZ_long"
        }];

        var opts =
            {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [horizon_btns] }
            }

        this.bot.sendMessage(chat_id, text, opts);
    }

    //Step 2
    this.setTransactionCurrencies = (chat_id) => {

        var text = "💡*Hint*\nGreat! You might feel like you are not receiving enough trade alerts, we suggest adding all possible altcoins to your watchlist. \nWould you like us to do it for you now? "
        var sigall_btns = [{
            "text": "Yes",
            "callback_data": "wizard.DB:SIGALL_true"
        },
        {
            "text": "No",
            "callback_data": "wizard.DB:SIGALL_false"
        }];

        var opts =
            {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [sigall_btns] }
            }

        this.bot.sendMessage(chat_id, text, opts);
    }

    //Step 3
    this.setCrowdSentiment = (chat_id) => {

        var text = "💡*Hint*\nLast step! You can enable _crowd sentiment feeds_ and contribute to identify how a news can influence the market.\nWould you like us to enable the feed? "
        var crowd_btns = [{
            "text": "Yes",
            "callback_data": "wizard.DB:CROWD_true"
        },
        {
            "text": "No",
            "callback_data": "wizard.DB:CROWD_false"
        }];

        var opts =
            {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [crowd_btns] }
            }

        this.bot.sendMessage(chat_id, text, opts);
    }

    this.run = (chat_id) => {
        this.setTraderProfile(chat_id)
    }

    this.bot_callback = (chat_id, data) => {
        let callback_data = data.split('_');


        if (callback_data[0] == 'RUN') {
            if (callback_data[1] == "true")
                this.setTraderProfile(chat_id)
            else
                this.bot.sendMessage(chat_id, 'Okay! You can always configure your /settings later! Signals will come soon!')
        }

        else if (callback_data[0] == 'HRZ') {
            api.updateUser(chat_id, { horizon: callback_data[1] })
                .then(na => {
                    this.setTransactionCurrencies(chat_id);
                })
                .catch((reason) => this.wizError(chat_id, reason))
        }

        else if (callback_data[0] == 'SIGALL') {
            if (callback_data[1] == "true") {
                api.selectAllSignals(chat_id)
                    .then(() => {
                        this.setCrowdSentiment(chat_id)
                    }).catch((reason) => this.wizError(chat_id, reason))
            } else {
                this.setCrowdSentiment(chat_id)
            }
        }

        else if (callback_data[0] == 'CROWD') {

            api.updateUser(chat_id, { is_crowd_enabled: callback_data[1] })
                .then(() => {
                    this.bot.sendMessage(chat_id, 'Perfect! You are all set, but you can change your choices using the /settings command or running the /wizard again!');
                }).catch((reason) => this.wizError(chat_id, reason))

        }
    }

    this.wizError = (chat_id, reason) => {
        console.log(reason)
        this.bot.sendMessage(chat_id, 'Something went wrong with the wizard');
    }
}

exports.Wizard = Wizard;