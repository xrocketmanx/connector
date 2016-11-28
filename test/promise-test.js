
var assert = require('assert');
var Promise = require('../utils/promise');

describe('Promise', function() {
    describe('Methods', function() {
        describe('#constructor()', function() {
            it('should set function to chain start', function() {
                var func = function() {};
                var promise = new Promise(func);
                assert.equal(func, promise._funcs[0]);
            });
        });

        describe('#then()', function() {
            it('should append function to chain', function() {
                var funcs = [function() {}, function() {}, function() {}];
                var promise = new Promise(funcs[0])
                    .then(funcs[1])
                    .then(funcs[2]);
                assert.deepEqual(funcs, promise._funcs);
            });
        });

        describe('#end()', function() {
            it('should call function from constructor', function(done) {
                var temp;
                new Promise(function(done) {
                    temp = 2;
                    done();
                }).end(function() {
                    assert.equal(temp, 2);
                    done();
                });
            });

            it('should receive values from previous func', function(done) {
                new Promise(function(done) {
                    done(2);
                }).end(function(temp) {
                    assert.equal(temp, 2);
                    done();
                });
            });

            it('should chain multiple functions', function(done) {
                new Promise(function(done) {
                    done([]);
                }).then(function(array, done) {
                    array.push(1);
                    done(array);
                }).then(function(array, done) {
                    array.push(2);
                    done(array);
                }).end(function(array) {
                    assert.deepEqual(array, [1, 2]);
                    done();
                });
            });

            it('should handle async functions', function(done) {
                new Promise(function(done) {
                    setTimeout(done, 500);
                }).end(done);
            });

            it('should handle returned promises in then', function(done) {
                var promise = new Promise(function(done) {
                    done(2);
                }).then(function(num, done) {
                    done(3 + num);
                });
                new Promise(function() {
                    return promise;
                }).end(function(num) {
                    assert.equal(num, 5);
                    done();
                });
            });

            it('should call returned promise in end', function() {
                var promise = new Promise(function(done) {
                    done(2);
                }).then(function(num) {
                    assert.equal(num, 2);
                    done();
                });
                new Promise().end(function() {
                    return promise;
                });
            });

            it('should handle errors', function(done) {
                new Promise(function(done, error) {
                    error('error!');
                }).error(function(msg) {
                    assert.equal(msg, 'error!');
                    done();
                }).then(function(done) {
                    done();
                }).end();
            });
        });
    });

    describe('Static methods', function() {
        describe('#each()', function() {
            var array;
            beforeEach(function() {
                array = [1, 2, 3, 4];
            });

            it('should pass through array elements', function() {
                var newArray = [];
                Promise.each(array, function(el, next) {
                    newArray.push(el);
                    next();
                });
                assert.deepEqual(array, newArray);
            });

            it('should call callback in the end', function(done) {
                Promise.each(array, function(el, next) { next(); }, function() {
                    done();
                });
            });
            
            it('should sequentially loop with async element handlers', function(done) {
                var newArray = [];
                var timeouts = [30, 10, 20, 10];
                Promise.each(array, function(el, next) {
                    setTimeout(function() {
                        newArray.push(el);
                        next();
                    }, timeouts.pop());
                }, function() {
                    assert.deepEqual(array, newArray);
                    done();
                });
            });
        });
        describe('#parallel()', function() {
            var array;
            beforeEach(function() {
                array = [1, 2, 3, 4];
            });

            it('should pass through array elements', function() {
                var newArray = [];
                Promise.parallel(array, function(el, done) {
                    newArray.push(el);
                    done();
                });
                assert.deepEqual(array, newArray);
            });

            it('should call callback in the end', function(done) {
                Promise.parallel(array, function(el, done) { done(); }, function() {
                    done();
                });
            });

            it('should parallel loop with async element handlers', function(done) {
                var newArray = [];
                var timeouts = [30, 10, 20, 40];
                Promise.parallel(array, function(el, done) {
                    setTimeout(function() {
                        newArray.push(el);
                        done();
                    }, timeouts.pop());
                }, function() {
                    assert.deepEqual(newArray, [3, 2, 4, 1]);
                    done();
                });
            });
        });
    });
});