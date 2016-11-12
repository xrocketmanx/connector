var ejs = require('ejs');
var path = require('path');
var Mixin = require('./mixin');

function ResponseMixin(connector) {
    Mixin.apply(this, arguments);

    this.render = function(name, data) {
        var self = this;
        ejs.renderFile(path.join(connector.get('views'), name) + '.ejs', data, {
            cache: true
        }, function(err, html) {
            if (err) {
                self.writeHead(500, {'Content-Type': 'text/plain'});
                self.end(err.toString());
            } else {
                self.writeHead(200, {'Content-Type': 'text/html'});
                self.end(html);
            }
        });
    };
}

ResponseMixin.prototype = Object.create(Mixin.prototype);
ResponseMixin.prototype.constructor = ResponseMixin;

module.exports = ResponseMixin;