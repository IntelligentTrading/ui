require('../util/extensions');
var _ = require('lodash');

function parseSignal(message_data) {

  var telegram_signal_message;

  var bst = getBaseSignalTemplate(message_data);

  if (message_data.signal == 'SMA' || message_data.signal == 'EMA') {

    var sma = getSMATemplate(message_data);
    telegram_signal_message = `${sma.sma_header_emoji} ${bst.header}\n${bst.price_change_text}, ${bst.price_text}\n${sma.trend_sentiment} ${sma.trend_strength}\n${bst.horizon_text}\n${sma.trend_traversal}\n`;
  }

  if (message_data.signal == 'RSI') {
    var rsi = getRSITemplate(message_data);
    telegram_signal_message = `${rsi.rsi_header_emoji} ${bst.header}\n${bst.price_change_text}, ${bst.price_text}\n${rsi.rsi_text}\n${bst.horizon_text}\n`;
  }

  return telegram_signal_message;
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

function getBaseSignalTemplate(message_data) {

  var price;
  var currency_symbol;

  if (message_data.coin == 'BTC') {
    currency_symbol = '$';
    price = message_data.price_usdt;
    price_change = message_data.price_usdt_change;
  }
  else {
    currency_symbol = 'BTC';
    price = message_data.price_satoshis / 100000000;
    price_change = message_data.price_satoshis_change;
  }

  var base_template = {
    horizon_text: message_data.horizon ? `${message_data.horizon.toSentenceCase()} horizon (${message_data.source.toSentenceCase()})` : message_data.horizon,
    header: `[#${message_data.coin}](https://coinmarketcap.com/coins/) on *${message_data.timestamp.toString().split('.')[0]} UTC*`,
    price_change_text: `*${price_change >= 0 ? '+' : ''}${(price_change * 100).toFixed(1)}%*`,
    price_text: price == undefined ? "" : `price: ${currency_symbol} ${price.toFixed(8)}`
  }

  return base_template;
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

function isDuplicateMessage(message) {

  cleanSortedCache();

  if (sorted_messages_cache.map(msg => msg.id).indexOf(message.MessageId) < 0) {
    sortedSignalInsertion({ id: message.MessageId, timestamp: Date.now() });
    return false;
  }

  return true;
}

var helper = {
  parse: (message) => parseSignal(message),
  hasValidTimestamp: (message) => hasValidTimestamp(message),
  isDuplicateMessage: (message) => isDuplicateMessage(message),
  sortedSignalInsertion: (signal) => sortedSignalInsertion(signal),
  decodeMessage: (message) => decodeMessage(message),
}

exports.signalHelper = helper;

/*{
    '_state':  <django.db.models.base.ModelState object at 0x10dd3c9e8>,
     'id':  6,
     'created_at':  datetime.datetime(2017,11,9,20,27,13,240960),
     'modified_at':  datetime.datetime(2017,11,9,20,27,13,240989),
     'UI':  0,
     'subscribers_only':  True,
     'text':  '',
     'source':  0,
     'coin':  'DASH',
     'signal':  'SMA',
     'trend':  1,
     'risk':  None,
     'horizon':  0,
     'strength_value':  1,
     'strength_max':  3,
     'price_satoshis':  4685451,
     'price_satoshis_change':  0.0009908535119860589,
     'price_usdt':  None,
     'price_usdt_change':  None,
     'volume_btc':  None,
     'volume_btc_change':  None,
     'volume_usdt':  None,
     'volume_usdt_change':  None,
     'timestamp':  datetime.datetime(2017,11,9,20,2,42,451940),
     'sent_at':  datetime.datetime(1970,1,1,0,0)
  }*/