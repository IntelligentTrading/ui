'use strict'

module.exports = class PaymentController {
    constructor(bot) {
        this.bot = bot
    }

    upgrade(chat_id) {

        var daysLeft = 0

        var text = `💰 *Upgrade*\n\nI'll guide you throw the upgrade process. You have currently ${daysLeft}, how many days do you want to subscribe for?`
        var subscription_days_btns = [{
            "text": "15 days",
            "callback_data": "upgrade.DB:15"
        },
        {
            "text": "30 days",
            "callback_data": "upgrade.DB:30"
        },
        {
            "text": "90 days",
            "callback_data": "upgrade.DB:90"
        }];
        var opts =
            {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [subscription_days_btns] }
            }
        this.bot.sendMessage(chat_id, text, opts);
    }


    pay(chat_id) {
        this.bot.sendMessage(chat_id, 'Thanks for paying')
    }
}
