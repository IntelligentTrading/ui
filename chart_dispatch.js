const TelegramBot = require('node-telegram-bot-api');
var express = require('express');
var path = require('path');
var crypto = require('crypto');
var app = express();
var fs = require('fs');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });

var plotly = require('plotly')(process.env.PLOTLY_USER, process.env.PLOTLY_API_KEY);

app.set('port', (process.env.PORT || 5000));

app.get('/', function (request, response) {
    // response.render('pages/index');
    response.sendStatus(200)
});

app.get('/chart', function (request, response) {

    var chat_id = request.query.chat_id;
    console.log(`Must create a chart for ${chat_id}!`);
    createChart(chat_id)
        .then((result) => {
            response.status(result.code).send(result.message);
        })
        .catch((reason) => {
            if (reason.code != null) {
                response.status(reason.code).send(reason.message);
            }
            else {
                response.status(500).send(reason);
            }

        });
});

app.listen(app.get('port'), function () {
    console.log('Chart service is running on port', app.get('port'));
});


function populate_trace(data) {
    return {
        y: data.y,
        type: "box",
        marker: { color: data.color },
        name: data.label
    };
}

function get_traces() {
    var traces = [];

    for (i = 0; i < 100; i++) {

        var values = [];
        values.push(Math.random() * 100);


        for (y = 1; y < 5; y++) {
            values.push(values[y - 1] + Math.random() * 10 + 5);
        }

        var trace_color = Math.random() > 0.5 ? '#FF0000' : '#00FF00';

        var data = {
            y: values,
            color: trace_color,
            label: 'trace ' + i
        };

        var new_trace = populate_trace(data);
        traces.push(new_trace);
    }

    return traces;
}

var createChart = function (chat_id) {
    return new Promise((resolve, reject) => {
        //TODO Call to the endpoint
        try {

            var traces_data = get_traces();

            var figure = { 'data': traces_data };

            var layout = {
                yaxis: {
                    title: "normalized moisture",
                    zeroline: false
                },
                xaxis: {
                    title: "Period"
                },
            };

            var imgOpts = {
                format: 'png',
                width: 1000,
                height: 500,
            };

            plotly.getImage(figure, imgOpts, function (error, imageStream) {
                if (error) {
                    console.log(error);
                    reject({ code: 500, message: error });
                }

                var chartName = crypto.randomBytes(6).toString('hex') + '.png';
                var fileStream = fs.createWriteStream(chartName).on('close', () => {

                    bot.sendPhoto(chat_id, chartName, { caption: 'Generic chart' })
                        .then(function () {
                            console.log(chartName + ' sent');
                            fs.unlinkSync(chartName);
                            console.log(chartName + ' deleted');

                            resolve({ code: 200, message: 'Success' });
                        })
                        .catch((reason) => {
                            reject({ code: reason.response.statusCode, message: reason.response.body });
                        });
                });

                imageStream.pipe(fileStream);

            });
        }
        catch (err) {
            console.log(err);
            reject({ code: 500, message: err });
        }
    });
}