var url = require('url');
var mixins = require('./mixins');
var staticProvider = require('./static-provider');

module.exports = function(connector) {
    function parseUrl(req) {
        req.url = url.parse(req.url, true);
    }

    return [parseUrl, staticProvider(connector), mixins(connector)];
};