var fs = require('fs');
var path = require('path');

var mimeTypes = {
    css: 'text/css',
    js: 'text/javascript',
    jpg: 'image/jpeg',
    png: 'image/png'
};

module.exports = function(connector) {
    var STATIC_PATTERN = /\/static\/(.+\.(.+))/;

    return function staticProvider(req, res, next) {
        var staticPath = connector.get('static');
        var matches = req.url.pathname.match(STATIC_PATTERN);

        if (matches) {
            var filePath = matches[1];
            var ext = matches[2];
            fs.readFile(path.join(staticPath, filePath), function(err, file) {
                if (err) {
                    res.error(500, err.toString());
                } else {
                    res.writeHead(200, {'Content-Type': mimeTypes[ext]});
                    res.end(file);
                }
            });
        } else {
            next();
        }
    }
};

