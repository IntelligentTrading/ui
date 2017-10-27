var express = require('express');
var path = require('path');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', function (request, response) {
    // response.render('pages/index');
    response.sendStatus(200)
});

app.get('/chart', function (request, response) {
    console.log('Must create a chart!');
    response.sendStatus(200);
});

app.listen(app.get('port'), function () {
    console.log('Chart service is running on port', app.get('port'));
});
