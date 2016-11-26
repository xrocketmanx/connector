var sqlite3 = require('sqlite3').verbose();
var SqlBuilder = require('./sql-builder');

function DBController(config) {
    this.db = null;
    this.config = config;
}

DBController.prototype.connect = function() {
    this.db = new sqlite3.Database(this.config.fileName);
};

DBController.prototype.close = function() {
    this.db.close();
};

DBController.prototype.insert = function(options, callback) {
    var sqlBuilder = new SqlBuilder();
    var statement = sqlBuilder
        .insert(options.table)
        .values(options.values);
    this.db.run(statement.toString(), function(error) {
        if (callback) callback(error, this.lastID);
    });
};

DBController.prototype.update = function(options, callback) {
    var sqlBuilder = new SqlBuilder();
    var statement = sqlBuilder
        .update(options.table)
        .set(options.values)
        .where(options.where);
    this.db.run(statement.toString(), callback);
};

DBController.prototype.delete = function(options, callback) {
    var sqlBuilder = new SqlBuilder();
    var statement = sqlBuilder
        .delete(options.table)
        .where(options.where);
    this.db.run(statement.toString(), callback);
};

DBController.prototype.select = function(options, callback) {
    var sqlBuilder = new SqlBuilder();
    var statement = sqlBuilder
        .select(options.table)
        .where(options.where)
        .order(options.order)
        .limit(options.limit);
    this.db.all(statement.toString(), callback);
};

DBController.prototype.count = function(table, callback) {
    var sqlBuilder = new SqlBuilder();
    var statement = sqlBuilder.count(table);
    this.db.get(statement.toString(), callback);
};

var config = null;
module.exports.setConfig = function(_config) {
    if (dbController) {
        dbController.config = _config;
    } else {
        config = _config;
    }
};

var dbController = null;
module.exports.getInstance = function() {
    if (!dbController) {
        dbController = new DBController(config);
    }
    return dbController;
};