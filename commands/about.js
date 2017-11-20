var version = require('../package.json').version;
var description = require('../package.json').description;
var long_description = `Empower your trading with <i>crypto market</i> predictors.\nApplying artificial intelligence and technical analysis, our fleet of data bots follow real-time data sources and send you actionable alerts for success in cryptocurrency markets.`;
var homepage = require('../package.json').homepage;
var contacts = "Website: http://intelligenttrading.org"+
"\nTelegram: https://t.me/intelligenttrading"+
"\nFacebook: https://www.facebook.com/ITT.Token"+
"\nTwitter: https://twitter.com/ITT_Token"+
"\nGithub: https://github.com/intelligenttrading"+
"\nReddit: https://www.reddit.com/r/ITT_Token/";

var about = {
    get: () => new Promise((resolve, reject) => {
        resolve(`<b>${description} v.${version}</b>\n\n${long_description}\n\n${contacts}\n`);
    })
}

exports.about = about;