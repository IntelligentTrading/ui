var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var chaiHttp = require('chai-http')
var _ = require('lodash')
var colors = require('colors')
var sinon = require('sinon')

const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: false })
const dispatcher = require('../telegram_dispatch')
const signalMock = require('./signalMock')

chai.use(chaiHttp)

var chat_id = process.env.TELEGRAM_TEST_CHAT_ID

describe('Telegram Dispatcher', () => {
    it('Dispatches the right signal', () => {
        dispatcher.notify(signalMock)
    })
})