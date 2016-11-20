function Promise(func) {
    this.funcs = [func];
}

Promise.prototype.then = function(func) {
    this.funcs.push(func);
    return this;
};

Promise.prototype.error = function(func) {
    this.onError = func;
    return this;
};

Promise.prototype.end = function(callback) {
    var self = this;
    var i = -1;
    done();

    function done() {
        i++;
        if (i < self.funcs.length) {
            var args = Array.prototype.slice.call(arguments).concat(done, error);
            self.funcs[i].apply(null, args);
        } else {
            if (callback) callback.apply(null, arguments);
        }
    }

    function error() {
        if (self.onError) self.onError.apply(null, arguments);
    }
};

Promise.each = function(collection, onNext, onEnd) {
    var i = -1;
    next();

    function next() {
        i++;
        if (i < collection.length) {
            onNext(collection[i], next);
        } else {
            if (onEnd) onEnd();
        }
    }
};

module.exports = Promise;