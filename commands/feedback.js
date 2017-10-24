var feedback = {
    storeFeedback: (msg) => new Promise((resolve, reject) => {

        if (msg === undefined || msg.trim() === "") {
            reject("Got any comments? We'd love to hear those! You can send us your thoughts by simply typing them behind the /feedback command. For example: /feedback More signals!");
        }
        else {
            setTimeout(function () { console.log(msg) }, 300);
            resolve('Thanks! Your feedback has been sent to the team and will be reviewed shortly.');
        }
    })
}

exports.feedback = feedback;