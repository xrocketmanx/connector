var Promise = require('../utils/promise');
var db = require('./db').getInstance();

function ModelCollection(Class, array) {
    array = array.map(createModel.bind(null, Class));

    array.save = function() {
        db.connect();
        return new Promise(function(done) {
            Promise.parallel(array, function(model) {
                return model.save(true);
            }, function() {
                db.close();
                done(array);
            });
        });
    };

    array.add = function() {
        var args = arguments;
        db.connect();
        return new Promise(function(done) {
            Promise.parallel(args, function(model) {
                return model.save(true);
            }, function() {
                db.close();
                array.push.apply(array, args);
                done(array);
            });
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
            return new Promise(function() {
                return Class.delete(filter).then(function() {
                    return Class.get();
                });
            });
        }
    };
    
    return array;
}

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

module.exports = ModelCollection;
