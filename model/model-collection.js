module.exports = function(db, Promise) {
    function ModelCollection(Class, array) {
        array = array.map(createModel.bind(null, Class));

        array.each = function(func, onEnd) {
            Promise.each(array, func, onEnd);
        };

        array.load = function(collections) {
            return new Promise(function(done) {
                Promise.parallel(array, function(model, nextModel) {
                    Promise.parallel(collections, function(collection, nextCollection) {
                        model[collection].load().end(function() {
                            nextCollection();
                        });
                    }, function() {
                        nextModel();
                    });
                }, function() {
                    done(array);
                });
            });
        };

        array.save = function() {
            return new Promise(function(done) {
                db.connect();
                Promise.parallel(array, function(model) {
                    return model.save(true);
                }, function() {
                    done(array);
                });
                db.close();
            });
        };

        array.add = function() {
            var args = arguments;
            return new Promise(function(done) {
                db.connect();
                Promise.parallel(args, function(model) {
                    return model.save(true);
                }, function() {
                    array.push.apply(array, args);
                    done(array);
                });
                db.close();
            });
        };

        array.remove = function(filter) {
            if (typeof filter === 'number') {
                return new Promise(function(done) {
                    array[filter].delete().end(function() {
                        array.splice(filter, 1);
                        done(array);
                    });
                });
            } else if (typeof filter === 'object') {
                return Class.delete(filter).then(function() {
                    return Class.get();
                });
            }
        };

        return array;
    }

    return ModelCollection;

    function createModel(Class, row) {
        var model = new Class();
        for (var i in row) {
            if (i !== 'id') {
                model[model._propsNames[i]] = row[i];
            } else {
                model[i] = row[i];
            }
        }
        return model;
    }
};

module.exports.inject = true;
