var api = require('../core/api').api;


function Wizard(bot) {
    this.bot = bot;

    //Step 1
    this.setTraderProfile = (chat_id) => {
        var text = "💡*Pick your profile*\nFirst, let's set up your trading profile. These profiles use 1hr, 4hr & 1D periods respectively. High risk means lots of alerts!"
        var horizon_btns = [{
            "text": "High Risk",
            "callback_data": "wizard.DB:HRZ_short"
        },
        {
            "text": "Medium Risk",
            "callback_data": "wizard.DB:HRZ_medium"
        },
        {
            "text": "Low Risk",
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

        var text = "💡*Enable all altcoins*\nGreat! We suggest enabling all altcoins at first. You can always change it later manually."
        var sigall_btns = [{
            "text": "Enable all",
            "callback_data": "wizard.DB:SIGALL_true"
        },
        {
            "text": "No thanks",
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

        var text = "💡*Enable sentiment alerts*\nLast step! We offer Crowd Sentiment alerts, they tell you what's going on in the market. Would you like us to enable them?"
        var crowd_btns = [{
            "text": "Turn Om",
            "callback_data": "wizard.DB:CROWD_true"
        },
        {
            "text": "Turn Off",
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
                    this.bot.sendMessage(chat_id, 'Thanks for your help! Please keep in mind it could take a while before alerts come in!');
                }).catch((reason) => this.wizError(chat_id, reason))

        }
    }

    this.wizError = (chat_id, reason) => {
        console.log(reason)
        this.bot.sendMessage(chat_id, 'Something went wrong with the wizard');
    }
}

exports.Wizard = Wizard;