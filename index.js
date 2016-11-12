var http = require('http');
var url = require('url');
var Router = require('./router');


function Connector() {
    var self = this;

    this._paths = {
        static: null,
        views: null,
        controllers: null
    };

    this._controllersCache = {};
    this._middleware = [];
    this._router = new Router();

    this._server = http.createServer(function(req, res) {
        self._middleware.forEach(function(func) {
            func(req, res);
        });
        req.url = url.parse(req.url, true);
        self.emit(req.url.pathname, req, res);
    });
}

Connector.prototype.set = function(key, value) {
    this._paths[key] = value;
};

Connector.prototype.get = function(key) {
    return this._paths[key];
};

Connector.prototype.use = function(func) {
    this._middleware.push(func);
};

Connector.prototype.on = function(path, controllerName) {
    if (!this._controllersCache[controllerName]) {
        this._controllersCache[controllerName] = require(this._paths.controllers + controllerName);
    }

    var controller = this._controllersCache[controllerName];
    this._router.set(path, controller);
};

Connector.prototype.emit = function(path, req, res) {
    var controllers = this._router.get(path);
    controllers.forEach(function(controller) {
        var method = req.method.toLowerCase();
        controller[method](req, res);
    });
};

Connector.prototype.listen = function(port, callback) {
    this._server.listen(port, callback);
};

module.exports = Connector;