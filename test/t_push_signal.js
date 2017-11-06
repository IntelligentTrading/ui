const sqs = require('sqs');

const queue = sqs({
    access: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,
    region: 'us-east-1' // defaults to us-east-1
});
const production_queue_name = process.env.SQS_PROD;

function Signal(type, risk, signal, coin, trend, strength, strength_max, horizon, price, price_change) {
    this.type = type;
    this.risk = risk;
    this.signal = signal;
    this.coin = coin;
    this.trend = trend;
    this.strength = strength;
    this.strength_max = strength_max;
    this.horizon = horizon;
    this.price = price;
    this.price_change = price_change;
}

//push_sma_signal("ETH",1,2,3,"medium",0.00123,0.05)
var tester = {
    push_trade_signal: (type, risk, signal, coin, trend, strength, strength_max, horizon, price, price_change) => {
        var message_data = new Signal(type, risk, signal, coin, trend, strength, strength_max, horizon, price, price_change);
        queue.push(production_queue_name, message_data, () =>
            console.log('Sending ' + JSON.stringify(message_data)));
    },
}

setInterval(() => tester.push_trade_signal("trade signal", "high", "ETH", 1, 2, 3, "medium", 0.00123, 0.05), 2000);

exports.signal_tester = tester;