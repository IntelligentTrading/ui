require('../util/extensions');
var tickers = require('./data/tickers').tickers;
var _ = require('lodash');

var counter_currencies = [];
tickers.counter_currencies().then(ccs => counter_currencies = ccs);

function parseSignal(message_data) {

  return getBaseSignalTemplate(message_data)
    .then((bst) => {

      var telegram_signal_message;
      if (message_data.signal == 'SMA' || message_data.signal == 'EMA') {

        var sma = getSMATemplate(message_data);
        telegram_signal_message = `${sma.sma_header_emoji} ${bst.header}\n${bst.price_change_text}, ${bst.price_text}\n${sma.trend_sentiment} ${sma.trend_strength}\n${bst.horizon_text}\n${sma.trend_traversal}\n`;
      }

      if (message_data.signal == 'RSI') {
        var rsi = getRSITemplate(message_data);
        telegram_signal_message = `${rsi.rsi_header_emoji} ${bst.header}\n${bst.price_change_text}, ${bst.price_text}\n${rsi.rsi_text}\n${bst.horizon_text}\n`;
      }

      if (message_data.signal == 'kumo_breakout') {
        var kumo = getKumoTemplate(message_data);
        telegram_signal_message = `${kumo.ichimoku_header_emoji} ${bst.wiki_header} ${bst.price} ${bst.currency_symbol}\n${kumo.ichimoku_text}`;
      }

      return telegram_signal_message;
    });
}

function getSMATemplate(message_data) {

  var trend_traversal_progress = message_data.strength_value < 3 ? `Confirmation ${message_data.strength_value} out of 3` : `Confirmed`;
  var trend_traversal_sign = `${(message_data.trend == -1 ? 'Negative' : 'Positive')}`;

  var sma_template = {
    sma_header_emoji: '🔔',
    trend_sentiment: `${(message_data.trend == -1 ? 'Bearish' : 'Bullish')}`,
    trend_strength: `${(message_data.trend == -1 ? '🔴' : '🔵').repeat(message_data.strength_value)}${'⚪️'.repeat(message_data.strength_max - message_data.strength_value)}`,
    trend_traversal: `(${trend_traversal_sign} trend reversal - ${trend_traversal_progress})`
  }

  return sma_template;
}

function getRSITemplate(message_data) {

  if (message_data.rsi_value < 1 || message_data.rsi_value > 100)
    throw new Error('Invalid RSI value');

  var rsi_emoji = `${(message_data.trend == -1 ? '✅' : '⛔')}`;
  var rsi_trend = ['Oversold', 'Neutral', 'Overbought'];
  var rsi_strength_values = ['', 'Very', 'Extremely'];
  var rsi_strength = rsi_strength_values[message_data.strength_value - 1];

  var rsi = {
    rsi_header_emoji: '📣',
    rsi_text: `${rsi_emoji} RSI ${parseInt(message_data.rsi_value).toFixed(1)} - ${rsi_strength} ${rsi_trend[parseInt(message_data.trend) + 1]} ${message_data.strength_value == 3 ? '⚠️' : ''}`,
  }

  return rsi;
}

function getKumoTemplate(message_data) {

  var ichi_emoji = `${(message_data.trend == -1 ? '🆘' : '✅')}`;
  var ichi_breakout = `${(message_data.trend == -1 ? 'Negative' : 'Positive')}`;
  var ichi_bias = `${(message_data.trend == -1 ? 'Bear' : 'Bull')}`;

  var ichimoku = {
    ichimoku_header_emoji: 'ℹ️',
    ichimoku_text: `Ichimoku: ${ichi_breakout} Cloud Breakout ${ichi_emoji}\nITT Bias: ${ichi_bias} trend continuation likely.`
  }

  return ichimoku;
}

function getBaseSignalTemplate(message_data) {

  console.log(message_data);

  var counter_currency_index = parseInt(message_data.counter_currency);

  // Let's round to the appropriate digits according to each counter currency
  var rounding_digits = [8, 5, 5, 5]
  var price = (message_data.price / 100000000).toFixed(rounding_digits[counter_currency_index]);

  var currency_symbol = counter_currencies[counter_currency_index].symbol;
  var price_change = message_data.price_change;

  return tickers.get()
    .then((tkrs) => {
      const coinmarketcap_url = "https://coinmarketcap.com/currencies/";
      if (tkrs == undefined || tkrs.length <= 0)
        return coinmarketcap_url;

      var matching_tkrs = tkrs.filter(t => t.symbol == message_data.transaction_currency);
      currency_wiki_data = matching_tkrs[0];
      if (currency_wiki_data == undefined) return coinmarketcap_url;

      return `${coinmarketcap_url}${currency_wiki_data.name}`;

    }).then((wiki_url) => {
      var base_template = {
        horizon_text: message_data.horizon ? `${message_data.horizon.toSentenceCase()} horizon (${message_data.source.toSentenceCase()})` : message_data.horizon,
        header: `[${message_data.transaction_currency}](${wiki_url}) on *${message_data.timestamp.toString().split('.')[0]} UTC*`,
        price_change_text: `*${price_change >= 0 ? '+' : ''}${(price_change * 100).toFixed(2)}%*`,
        price_text: price == undefined ? "" : `price: ${currency_symbol} ${price}`,
        currency_symbol: currency_symbol,
        price: price,
        wiki_header: `[${message_data.transaction_currency}](${wiki_url})`
      }

      return base_template;
    });
}

function decodeMessage(message_body) {

  var message_data_64 = message_body;
  try {
    var message_data_string = Buffer.from(message_data_64, 'base64').toString();
    return JSON.parse(message_data_string);
  }
  catch (err) {
    console.log(err);
    return;
  }
}


var sorted_messages_cache = [];

function sortedSignalInsertion(newSignal) {
  sorted_messages_cache.splice(_.sortedIndexBy(sorted_messages_cache, newSignal, function (signal) { signal.timestamp }), 0, newSignal);
}

function cleanSortedCache() {
  while (sorted_messages_cache.length > 50)
    sorted_messages_cache.pop();
}

function hasValidTimestamp(messageBody) {

  return messageBody != undefined &&
    messageBody.timestamp != undefined &&
    Date.now() - Date.parse(messageBody.timestamp) < 15 * 60000; // 15 minutes 
}

function isDuplicateMessage(messageId, signalId) {

  cleanSortedCache();

  if (sorted_messages_cache.filter(record => record.messageId == messageId || record.signalId == signalId).length <= 0) {

    sortedSignalInsertion({ messageId: messageId, signalId: signalId, timestamp: Date.now() });
    return false;
  }

  return true;
}

// If the counter and transaction currencies are the same, skip
function isCounterCurrency(messageBody) {
  return messageBody.transaction_currency == tickers.counter_currencies[parseInt(messageBody.counter_currency)]
}

var helper = {
  parse: (message) => parseSignal(message),
  hasValidTimestamp: (message_body) => hasValidTimestamp(message_body),
  isDuplicateMessage: (messageId, signalId) => isDuplicateMessage(messageId, signalId),
  isCounterCurrency: (message_body) => isCounterCurrency(message_body),
  sortedSignalInsertion: (signal) => sortedSignalInsertion(signal),
  decodeMessage: (message) => decodeMessage(message),
}

exports.signalHelper = helper;
