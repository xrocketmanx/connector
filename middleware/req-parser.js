var url = require('url');
var qs = require('querystring');

module.exports = function() {
    return function(req, res, next) {
        req.url = parsers.query(req.url);
        if (req.method === 'POST') {
            var body = '';
            req.on('data', function(data) {
                body += data;
            });
            req.on('end', function() {
                var type = parsers.type(req.headers['content-type']);
                req.body = parsers[type](body);
                next();
            });
        } else {
            next();
        }
    };
};

var TYPES = ['urlencoded', 'json'];
var parsers = {
    type: function(type) {
        for (var i = 0; i < TYPES.length; i++) {
            if (type.indexOf(TYPES[i]) >= 0) {
                return TYPES[i];
            }
        }
        return '';
    },
    query: function(content) {
        return url.parse(content, true);
    },
    urlencoded: function(content) {
        return qs.parse(content);
    },
    json: function(content) {
        return JSON.parse(content);
    }
};