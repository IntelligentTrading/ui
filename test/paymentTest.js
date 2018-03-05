var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var chaiHttp = require('chai-http')
var _ = require('lodash')
var colors = require('colors')
var sinon = require('sinon')

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });
var PaymentContructor = require('../commands/payment')
var payment = new PaymentContructor(bot)
var paymentApi = require('../core/paymentServiceApi')

chai.use(chaiHttp)

var chat_id = process.env.TELEGRAM_TEST_CHAT_ID
var callbackDays = 15

// Transaction with > 12 ETH on Ropsten test net
var ropstenSampleTx = '0x07f3879c01ca1610c66af28a7f4c44d9636b2913869f89a184a3223356a54a20'

describe('Payment Controller', () => {
    it('starts the payment process on /upgrade', () => {
        var upgrade = sinon.spy(payment, 'upgrade')
        payment.upgrade(chat_id)
        expect(upgrade.called).to.be.true
    })

    it('ITT token calculation for N days is correct', () => {
        var ittTokens = payment.ittToPay(chat_id, callbackDays)
        expect(ittTokens).to.be.equal(callbackDays)
    })

    it('Callback data payment.ittToPay:N returns the right amount of ITT to pay (N)', () => {
        payment.callback(chat_id, 'payment.ittToPay:' + callbackDays, (ittToPay) => {
            expect(ittToPay).to.be.equal(callbackDays)
        })
    })

    it('Selected days callback calls the ITT calculation routine', () => {

        var expectedITT = sinon.spy(payment, 'ittToPay')
        payment.callback(chat_id, 'payment.ittToPay:' + callbackDays)
        expect(expectedITT.getCall(0).args[1]).to.be.equal(callbackDays.toString())
    })

    it('Specify ITT receiver address (QR)', () => {
        var rxAddress = payment.ittRxAddress(chat_id, 'true')
        expect(rxAddress).to.be.not.null
        expect(rxAddress).to.be.not.undefined
    })

    it('Transaction verification calls etherscan API and returns the transaction on success', () => {
        var paymentApiSpy = sinon.spy(paymentApi, 'verify')
        return payment.verifyTx(chat_id, ropstenSampleTx).then(transaction => {
            expect(paymentApiSpy.getCall(0).args[0]).to.be.equal(ropstenSampleTx)
            expect(transaction.hash).to.be.equal(ropstenSampleTx)
            paymentApiSpy.restore()
        })
    })

    it('Transaction verification calls etherscan API and returns 500 on bad TxHash', () => {
        var paymentApiSpy = sinon.spy(paymentApi, 'verify')
        return payment.verifyTx(chat_id, '0x1111')
            .catch(result => {
                expect(result.statusCode).to.be.equal(500)
                paymentApiSpy.restore()
            })
    })

    it('Transaction verification throws exception on empty transaction', () => {
        return payment.verifyTx(chat_id).catch(err => {
            return expect(err.message).to.be.equal('Empty Tx')
        })
    })
})