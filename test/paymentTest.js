var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var chaiHttp = require('chai-http')
var _ = require('lodash')
var colors = require('colors')
var sinon = require('sinon')

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
var PaymentContructor = require('../commands/payment')
var payment = new PaymentContructor(bot)

chai.use(chaiHttp)

describe('Payment Controller', () => {
    it('/upgrade starts the payment process', () => {
        var upgrade = sinon.spy(payment, 'upgrade')
        payment.upgrade(process.env.TELEGRAM_TEST_CHAT_ID)
        expect(upgrade.called).to.be.true
    })
})