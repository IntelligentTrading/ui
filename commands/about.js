var version = require('../package.json').version;
var description = require('../package.json').description;

var about = {
    get: () => new Promise((resolve, reject) => {
        resolve(`${description}\nBot version ${version}`);
    })
}

exports.about = about;