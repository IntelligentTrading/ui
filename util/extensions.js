String.prototype.toSentenceCase = function() {
    return this[0].toUpperCase() + this.slice(1);
}

Object.prototype.isJSON = function(){
    try {
        JSON.parse(this);
        return true;
    } catch (e) {
        return false;
    }
}