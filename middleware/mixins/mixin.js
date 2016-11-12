function Mixin(connector) {
    this.connector = connector;
}

Mixin.prototype.mix = function(obj) {
    for (var key in this) {
        if (this.hasOwnProperty(key)) {
            obj[key] = this[key];
        }
    }
};

module.exports = Mixin;