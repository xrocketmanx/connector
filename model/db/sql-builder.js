function SqlBuilder() {
    this.statement = '';
}

SqlBuilder.prototype.toString = function() {
    return this.statement;
};

SqlBuilder.prototype.insert = function(table) {
    var pattern = "INSERT INTO '$'";
    this.statement += formatStatement(pattern, table);
    return this;
};

SqlBuilder.prototype.select = function(table) {
    var pattern = "SELECT * FROM '$'";
    this.statement += formatStatement(pattern, table);
    return this;
};

SqlBuilder.prototype.update = function(table) {
    var pattern = "UPDATE '$'";
    this.statement += formatStatement(pattern, table);
    return this;
};

SqlBuilder.prototype.delete = function(table) {
    var pattern = "DELETE FROM '$'";
    this.statement += formatStatement(pattern, table);
    return this;
};

SqlBuilder.prototype.count = function(table) {
    var pattern = "SELECT count(*) as count FROM '$'";
    this.statement += formatStatement(pattern, table);
    return this;
};

SqlBuilder.prototype.where = function(values) {
    if (!values) return this;

    var pattern = " WHERE $";
    var partPattern = "$ $ '@'";
    var delimiter = " AND ";

    var parts = [];
    for (var key in values) {
        if (typeof values[key] === 'object') {
            parts.push(formatStatement(partPattern, key, values[key].sign, values[key].value));
        } else {
            parts.push(formatStatement(partPattern, key, '=', values[key]));
        }
    }
    this.statement += formatStatement(pattern, parts.join(delimiter));
    return this;
};

SqlBuilder.prototype.order = function(values) {
    if (!values) return this;

    var pattern = " ORDER BY $";
    var partPattern = "$ $";
    var delimiter = ",";

    var parts = [];
    for (var key in values) {
        parts.push(formatStatement(partPattern, key, values[key]));
    }
    this.statement += formatStatement(pattern, parts.join(delimiter));
    return this;
};

SqlBuilder.prototype.limit = function(options) {
    if (!options) return this;

    var pattern = " LIMIT '@' OFFSET '@'";

    this.statement += formatStatement(pattern, options.num, options.offset || 0);
    return this;
};

SqlBuilder.prototype.set = function(values) {
    var pattern = " SET $";
    var partPattern = "$ = '@'";
    var delimiter = ",";

    var parts = [];
    for (var key in values) {
        parts.push(formatStatement(partPattern, key, values[key]));
    }
    this.statement += formatStatement(pattern, parts.join(delimiter));
    return this;
};

SqlBuilder.prototype.values = function(values) {
    var pattern = " ($) VALUES ($)";
    var partPattern = "'@'";
    var delimiter = ",";

    var keys = [];
    var vals = [];
    for (var key in values) {
        keys.push(formatStatement(partPattern, key));
        vals.push(formatStatement(partPattern, values[key]));
    }
    this.statement += formatStatement(pattern, keys.join(delimiter), vals.join(delimiter));
    return this;
};

module.exports = SqlBuilder;

function formatStatement(command) {
    var result = '';
    for (var i = 0, j = 1; i < command.length; i++) {
        if (command[i] === '$') {
            result += arguments[j++];
        } else if (command[i] === '@') {
            result += quote(arguments[j++]);
        } else {
            result += command[i];
        }
    }
    return result;
}

function quote(value) {
    if (typeof value === 'string') {
        return value.replace(/'/g, '');
    } else {
        return value;
    }
}