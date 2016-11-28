/**
 * Small realization for promises
 * @param {Function} func first function in chain
 * @constructor
 */
function Promise(func) {
    this._funcs = [func];
}

/**
 * Continues function chain
 * @param {Function} func accepts done method
 * @returns {Promise}
 */
Promise.prototype.then = function(func) {
    this._funcs.push(func);
    return this;
};

/**
 * Function called as error handler
 * @param {Function} func
 * @returns {Promise}
 */
Promise.prototype.error = function(func) {
    this.onError = func;
    return this;
};

/**
 * Ends chain and start chain functions calls
 * @param {Function} [func] called last
 */
Promise.prototype.end = function(func) {
    var self = this;
    var pos = -1;
    done();

    function done() {
        var next = moveNext();
        if (next) {
            var args = Array.prototype.slice.call(arguments).concat(done, error);
            call(self._funcs[pos], args, function() {
                done.apply(null, arguments);
            });
        } else {
            call(func, arguments);
        }
    }

    function error() {
        if (self.onError) self.onError.apply(null, arguments);
    }

    function moveNext() {
        pos++;
        return pos < self._funcs.length;
    }

    function call(func, args, onEnd) {
        if (!func) return;

        var res = func.apply(null, args);
        if (res instanceof Promise) {
            res.error(function() {
                error.apply(null, arguments);
            }).end(onEnd);
        }
    }
};

/**
 * Sequentially async loop through collection elements.
 * When onNext is async call next method to handle next element.
 * @param {Array} collection
 * @param {Function} onNext accepts next method
 * @param {Function} [onEnd]
 */
Promise.each = function(collection, onNext, onEnd) {
    var pos = -1;
    next();

    function next() {
        pos++;
        if (pos < collection.length) {
            onNext(collection[pos], next);
        } else {
            if (onEnd) onEnd();
        }
    }
};

/**
 * Parallel async loop through collection elements.
 * @param {Array} collection
 * @param {Function} onNext accepts done method
 * @param {Function} onEnd
 */
Promise.parallel = function(collection, onNext, onEnd) {
    var pos = 0;
    for (var i = 0; i < collection.length; i++) {
        var res = onNext(collection[i], done);
        if (res instanceof Promise) {
            res.end(done);
        }
    }

    function done() {
        pos++;
        if (pos === collection.length) {
            if (onEnd) onEnd();
        }
    }
};

module.exports = Promise;