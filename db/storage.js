var request = require('request');

var api_url = `https://${process.env.ITT_API_HOST}`;

var storage = {
        storeSettings: (chat_id, optionals) =>
        new Promise((resolve, reject) => {

            if(chat_id == null || chat_id == undefined)
                throw new Error('Chat id cannot be null or undefined');

            var postParameters = Object.assign({},{chat_id : chat_id},optionals);

            request.post({
                url: `${api_url}/user`,
                form: postParameters
            }, function (error, response, body) {
                if (response != null && response.statusCode == 200) {
                    resolve('Ok');
                }
                else {
                    reject(`${response.statusCode}:${response.statusMessage}\n${body}`);
                }
            });
        })
}

exports.storage = storage;