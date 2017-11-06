const { spawn } = require('child_process');
const request = require('request');
const signal_pusher = require('./test/signal_pusher').pusher;
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
    signal_pusher.push(req.body);
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