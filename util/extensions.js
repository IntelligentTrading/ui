String.prototype.toSentenceCase = function() {
    return this[0].toUpperCase() + this.slice(1);
}