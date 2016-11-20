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
            var res = self.funcs[i].apply(null, args);
            if (res instanceof Promise) {
                res.error(function() {
                    error.apply(null, arguments);
                }).end(function() {
                    done.apply(null, arguments);
                });
            }
        } else {
            if (callback) {
                var res = callback.apply(null, arguments);
                if (res instanceof Promise) {
                    res.error(function() {
                        error.apply(null, arguments);
                    }).end();
                }
            }
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

Promise.parallel = function(collection, onNext, onEnd) {
    var num = 0;
    for (var i = 0; i < collection.length; i++) {
        var res = onNext(collection[i], done);
        if (res instanceof Promise) {
            res.end(done);
        }
    }

    function done() {
        num++;
        if (num === collection.length) {
            onEnd();
        }
    }
};

module.exports = Promise;