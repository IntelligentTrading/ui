'use strict'

var paymentApi = require('../core/paymentServiceApi')

module.exports = class PaymentController {
    constructor(bot) {
        this.bot = bot
    }

    upgrade(chat_id) {

        paymentApi.userInfo(chat_id)
            .then(status => {
                var text = `*Upgrade*\n\nYou have currently ${status.subscriptionDaysLeft} paid days left (exp. date ${status.expirationDate}). How many days do you want to add to your subscription?`

                var subscription_days_btns = [{
                    "text": "15 days",
                    "callback_data": "payment.ittToPay:15"
                },
                {
                    "text": "30 days",
                    "callback_data": "payment.ittToPay:30"
                },
                {
                    "text": "90 days",
                    "callback_data": "payment.ittToPay:90"
                }];

                var opts =
                    {
                        parse_mode: 'Markdown',
                        reply_markup: { inline_keyboard: [subscription_days_btns] }
                    }
                this.bot.sendMessage(chat_id, text, opts);
            })
    }

    verifyTx(chat_id, txHash) {
        if (txHash == null) {
            return this.bot.sendMessage(chat_id, 'Transaction cannot be null or empty, try again!')
                .then(x => {
                    throw new Error('Empty Tx')
                })
        }
        else {
            this.bot.sendMessage(chat_id, 'We are verifying the transaction on the blockchain, it will take time if the block is not yet confirmed!')
            return paymentApi.verify(txHash, chat_id).then(transaction => {
                this.bot.sendMessage(chat_id, 'Transaction has been verified!')
                return transaction
            }).catch(err => {
                this.bot.sendMessage(chat_id, err.error)
                return err
            })
        }
    }

    ittToPay(chat_id, days) {
        var intDays = parseInt(days)

        var confirm_payment_btns = [{
            "text": "Yes",
            "callback_data": "payment.ittRxAddress:true"
        },
        {
            "text": "No",
            "callback_data": "payment.ittRxAddress:false"
        }];
        var opts =
            {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [confirm_payment_btns] }
            }
        this.bot.sendMessage(chat_id, `For ${days} days you must send ${intDays} ITT, do you want to proceed?`, opts)
        return intDays
    }

    ittRxAddress(chat_id, proceed) {
        //requires API or env variable
        //! Test account #2
        var rxAddress = '0xABCDabcd1234567890'
        if (proceed == 'true') {
            this.bot.sendMessage(chat_id, `Great, you can now send the ITT to this address:\n${rxAddress}`)
                .then(() => {
                    this.bot.sendMessage(chat_id, `Once done execute /verifytx followed by the transaction address to confirm the payment.`)
                })
            return rxAddress
        }
    }

    callback(chat_id, data, finalize) {
        //function:argument
        var dataArray = data.split('.')[1].split(':')
        var func = dataArray[0]
        var argument = dataArray[1]
        var result = this[func](chat_id, argument)
        if (result && finalize)
            finalize(result)
    }
}