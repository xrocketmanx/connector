var ejs = require('ejs');
var path = require('path');
var Mixin = require('./mixin');

function ResponseMixin(connector) {
    this.error = function(code, message) {
        this.writeHead(code, {'Content-Type': 'text/html'});
        this.end('<h1>' + code + '</h1>' + message);
    };

    this.render = function(name, data) {
        var self = this;
        ejs.renderFile(path.join(connector.get('views'), name) + '.ejs', data, {
            cache: true
        }, function(err, html) {
            if (err) {
                self.error(500, err.toString());
            } else {
                self.writeHead(200, {'Content-Type': 'text/html'});
                self.end(html);
            }
        });
    };

    this.sendJSON = function(data) {
        var result = JSON.stringify(data);
        this.writeHead(200, {'Content-Type': 'application/json'});
        this.end(result);
    };

    this.redirect = function(path) {
        this.writeHead(302, {'Location': path});
        this.end();
    };
}

ResponseMixin.prototype = Object.create(Mixin.prototype);
ResponseMixin.prototype.constructor = ResponseMixin;

module.exports = ResponseMixin;