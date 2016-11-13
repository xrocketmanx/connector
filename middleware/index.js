var url = require('url');
var mixins = require('./mixins');
var staticProvider = require('./static-provider');
var logger = require('./logger');

module.exports = function(connector) {
    function parseUrl(req, res, next) {
        req.url = url.parse(req.url, true);
        next();
    }

    return [parseUrl, logger(), staticProvider(connector), mixins(connector)];
};