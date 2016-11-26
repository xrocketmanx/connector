module.exports = function(DB, Promise, ModelCollection) {
    var db = DB.getInstance();

    function Model() {
        this._props = Object.create(null);
        this._propsNames = Object.create(null);
        this.id = null;
    }

    Model.extend = function(Class) {
        Class.prototype = Object.create(Model.prototype);
        Class.prototype.constructor = Class;
        Class.prototype._TABLE = Class.name.toLowerCase();

        Class.setTable = function(tableName) {
            Class.prototype._TABLE = tableName;
        };

        Class.get = function(options) { // filter, sort, load
            options = options || {};
            return new Promise(function(done, error) {
                db.connect();
                db.select({
                    table: Class.prototype._TABLE,
                    where: options.filter,
                    order: options.sort
                }, function(err, rows) {
                    if (err) {
                        error(err);
                    } else {
                        var collection = ModelCollection(Class, rows);
                        if (options.load) {
                            collection.load(options.load).end(function() {
                                done(collection)
                            });
                        } else {
                            done(collection);
                        }
                    }
                });
                db.close();
            });
        };

        Class.delete = function(filter) {
            return new Promise(function(done, error) {
                db.connect();
                db.delete({
                    table: Class.prototype._TABLE,
                    where: filter
                }, function(err) {
                    if (err) {
                        error(err);
                    } else {
                        done();
                    }
                });
                db.close();
            });
        };

        Class.count = function() {
            return new Promise(function(done, error) {
                db.connect();
                db.count(Class.prototype._TABLE, function(err, row) {
                    if (err) {
                        error(err);
                    } else {
                        done(row.count);
                    }
                });
                db.close();
            });
        };
    };

    Model.setConfig = function(config) {
        DB.setConfig(config);
    };

    /*MODEL PROTO METHODS*/

    Model.prototype.field = function(options) {
        var type = options.type || 'string';
        var dbName = getDbName(options.name);
        this._propsNames[dbName] = options.name;

        Object.defineProperty(this, options.name, {
            enumerable: true,
            get: function() {
                return this._props[dbName];
            },
            set: function(value) {
                if (value === null || value === undefined) {
                    this._props[dbName] = null;
                } else if (type === 'number') {
                    this._props[dbName] = +value;
                } else if (type === 'date') {
                    this._props[dbName] = (new Date(value)).getTime();
                } else if (type === 'string') {
                    this._props[dbName] = value;
                }

            }
        });
        this[options.name] = options.value;
    };

    Model.prototype.children = function(options) {
        var self = this;
        var Class = options.class;
        var foreignName = getDbName(options.foreign) + '_id';
        var models = ModelCollection(Class, []);

        models.load = function() {
            if (self.id !== null) {
                var filter = {};
                filter[foreignName] = self.id;
                return Class.get({filter: filter}).then(function(children, done) {
                    //TODO: Create collection for childrean instead copy
                    children.forEach(function(child) {
                        child[options.foreign] = self;
                    });
                    models.length = 0;
                    models.push.apply(models, children);
                    done(self);
                });
            } else {
                return new Promise(function(done) {
                    done(self);
                });
            }
        };

        var oldAdd = models.add;
        models.add = function() {
            for (var i = 0; i < arguments.length; i++) {
                arguments[i].parent = self;
            }
            return oldAdd.apply(this, arguments);
        };

        Object.defineProperty(this, options.descriptor, {
            get: function() {
                return models;
            }
        });
    };

    //TODO: Remake something
    Model.prototype.parent = function(options) {
        var self = this;
        var Class = options.class;
        var dbName = getDbName(options.name) + '_id';
        this._propsNames[dbName] = options.name;

        var parent = {
            model: null,
            load: function() {
                return new Promise(function(done) {
                    if (self._props[dbName] !== undefined) {
                        return Class.get({filter: {id: self._props[dbName]}}).then(function(models, done) {
                            parent.model = models[0];
                            done(self);
                        });
                    } else {
                        done(self);
                    }
                });
            }
        };
        Object.defineProperty(this, options.name, {
            get: function() {
                return parent;
            },
            set: function(value) {
                if (typeof value === 'object') {
                    this._props[dbName] = +value.id;
                    parent.model = value;
                } else {
                    this._props[dbName] = +value;
                    parent.model = {id: +value};
                }
            }
        });
    };

    //TODO: Trigger all collections
    Model.prototype.save = function(keepcon) {
        var self = this;

        if (this.id === null) {
            return new Promise(function(done, error) {
                if (!keepcon) db.connect();
                db.insert({
                    table: self._TABLE,
                    values: self._props
                }, function(err, id) {
                    if (err) {
                        error(err);
                    } else {
                        self.id = id;
                        done(self);
                    }
                });
                if (!keepcon) db.close();
            });
        } else {
            return new Promise(function(done, error) {
                if (!keepcon) db.connect();
                db.update({
                    table: self._TABLE,
                    values: self._props,
                    where: {id: self.id}
                }, function(err) {
                    if (err) {
                        error(err);
                    } else {
                        done(self);
                    }
                });
                if (!keepcon) db.close();
            });
        }
    };

    Model.prototype.delete = function(keepcon) {
        var self = this;
        return new Promise(function(done, error) {
            if (!keepcon) db.connect();
            db.delete({
                table: self._TABLE,
                where: {id: self.id}
            }, function(err) {
                if (err) {
                    error(err);
                } else {
                    done();
                }
            });
            if (!keepcon) db.close();
        });
    };

    return Model;

    function getDbName(name) {
        return name.replace(/([A-Z])/g, '_$1').toLowerCase();
    }
};

module.exports.inject = true;