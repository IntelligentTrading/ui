const { spawn } = require('child_process');
const request = require('request');
const signal_suite = require('./test/t_push_signal').signal_tester;
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5001));

app.get('/', function (request, response) {
  // response.render('pages/index');
  response.sendStatus(200)
});

app.post('/signal', function (req, res) {

  try {
    var payload = req.body;
    var type = payload.type;
    var risk = payload.risk;
    var signal = payload.signal;
    var coin = payload.coin;
    var trend = payload.trend;
    var strength = payload.strength;
    var strength_max = payload.strength_max;
    var horizon = payload.horizon;
    var price = payload.price;
    var price_change = payload.price_change;

    signal_suite.push_trade_signal(type,risk,signal,coin, trend, strength, strength_max, horizon, price, price_change);
    res.sendStatus(200);
  }
  catch (err) {
    console.log(err);
    res.sendStatus(500).send(err);
  }
});

app.listen(app.get('port'), function() {
  console.log('Test Suite is running on port', app.get('port'));
});