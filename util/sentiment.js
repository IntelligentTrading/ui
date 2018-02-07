var cumulativeReaction = (ittReaction, baseReaction) => {
    return ittReaction ? ittReaction.length + baseReaction : baseReaction
}

var sentimentUtil = {
    messageTemplate: (updatedFeed, message) => {
        var messageText = message.text.substring(0, message.text.lastIndexOf('\n'))
        return `${messageText}\n${cumulativeReaction(updatedFeed.ittBullish, updatedFeed.votes.positive)} ⇧ ${cumulativeReaction(updatedFeed.ittBearish, updatedFeed.votes.negative)} ⇩ ${cumulativeReaction(updatedFeed.ittImportant, updatedFeed.votes.important)}‼`
    }
}

exports.sentimentUtil = sentimentUtil;