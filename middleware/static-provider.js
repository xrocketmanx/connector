var fs = require('fs');

var mimeTypes = {
    css: 'text/css',
    js: 'text/javascript',
    jpg: 'image/jpeg',
    png: 'image/png'
};

module.exports = function(connector) {
    return function staticProvider(req, res) {
        var staticPath = connector.get('static');
        var path = req.url.pathname;

        if (path.indexOf('/static') === 0) {
            path = path.replace('/static/', '');
            var ext = path.match(/\.(.+)/)[1];
            fs.readFile(staticPath + path, function(err, file) {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'text/plane'});
                    res.end(err.toString());
                } else {
                    res.writeHead(200, {'Content-Type': mimeTypes[ext]});
                    res.end(file);
                }
            });
        }
    }
};

