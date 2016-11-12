var http = require('http');
var path = require('path');
var Router = require('./router');
var middleware = require('./middleware');

function Connector(root) {
    var self = this;

    this._paths = {
        static: null,
        views: null,
        controllers: null
    };

    this._root = root;
    this._controllersCache = {};
    this._middleware = middleware(this);
    this._router = new Router();

    this._server = http.createServer(function(req, res) {
        self._middleware.forEach(function(func) {
            func(req, res);
        });
        self.emit(req.url.pathname, req, res);
    });
}

Connector.prototype.set = function(key, value) {
    this._paths[key] = path.join(this._root, value);
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