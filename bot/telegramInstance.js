const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const markdown_opts = {
    parse_mode: "Markdown"
}

module.exports = {
    bot: bot,
    markdown: {
        parse_mode: "Markdown"
    },
    nopreview_markdown_opts: {
        parse_mode: "Markdown",
        disable_web_page_preview: "true"
    },
    nopreview_hmtl_opts: {
        parse_mode: "HTML",
        disable_web_page_preview: "true"
    }
}