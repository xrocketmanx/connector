var mixins = require('./mixins');
var staticProvider = require('./static-provider');
var logger = require('./logger');
var reqParser = require('./req-parser');

module.exports = function(connector) {
    return [reqParser(), logger(), mixins(connector), staticProvider(connector)];
};