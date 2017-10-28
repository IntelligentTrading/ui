const request = require('request');
const express = require('express');
const app = express();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// const aws = require('aws-sdk');

// let s3 = new aws.S3({
//   accessKeyId: process.env.AWS_KEY,
//   secretAccessKey: process.env.AWS_SECRET
// });

const sqs = require('sqs');

const queue = sqs({
   access: process.env.AWS_KEY,
   secret: process.env.AWS_SECRET,
   region: 'us-east-1' // defaults to us-east-1
});
const production_queue_name = "intelligenttrading-sqs-production"

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });
const telegram_message_options = {
  parse_mode: "Markdown"
};


function onSQSMessage(message_data, callback) {
  if (message_data.type == "trade signal"){
    var risk = message_data.risk

    request(`https://${process.env.ITT_API_HOST}/users?risk=${risk}`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body)
            data['chat_ids'].foreach(function(chat_id){
              bot.sendMessage(chat_id, ("this is a trade signal"));
            });
        }
    });
  }
  callback(); // we are done with this message - pull a new one
              // calling the callback will also delete the message from the queue
}


queue.pull(production_queue_name, [workers=1], onTestMessage)





// ======== For Testing Purposes ========
// ======== push and pull from SQS, then send yourself a message ========
// ======== set your personal chat id and uncomment 3 lines  ========

// const telegram_test_chat_id = process.env.TELEGRAM_TOM_CHAT_ID
const stage_queue_name = "intelligenttrading-sqs-stage"

// pull messages from the test queue
function onTestMessage(message, callback) {
    console.log('someone pushed', message);
    // bot.sendMessage(telegram_test_chat_id, message);
    callback();
}

queue.push(stage_queue_name, "this is a test message")
queue.pull(stage_queue_name, [workers=1], onTestMessage)

// bot.sendMessage(telegram_test_chat_id, ("online and polling from queue: " + production_queue_name));

// ======== END Testing Stuff ========
