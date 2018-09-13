var cumulativeReaction = (ittReaction, baseReaction) => {
    return ittReaction ? ittReaction.length + baseReaction : baseReaction
}

module.exports = {
    messageTemplate: (updatedFeed, message) => {
        var messageText = message.text.substring(0, message.text.lastIndexOf('\n'))
            .replace('Read on CryptoPanic', `[Read on CryptoPanic](${updatedFeed.url})`)
            .replace('Crowd Sentiment', '*Crowd Sentiment*')
        return `${messageText}\n${cumulativeReaction(updatedFeed.ittBullish, updatedFeed.votes.positive)} ⇧ ${cumulativeReaction(updatedFeed.ittBearish, updatedFeed.votes.negative)} ⇩ ${cumulativeReaction(updatedFeed.ittImportant, updatedFeed.votes.important)}‼`
    }
}