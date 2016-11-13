function Router() {
    var routes = {};

    this.set = function(route, controller) {
        if (!routes[route]) {
            routes[route] = {
                pattern: new RegExp(route),
                controllers: []
            };
        }

        routes[route].controllers.push(controller);
    };

    this.get = function(path) {
        var matches = [];
        for (var key in routes) {
            var route = routes[key];
            if (route.pattern.test(path)) {
                matches = matches.concat(route.controllers);
            }
        }
        return matches;
    };

    this.each = function(controllers, callback) {
        var i = -1;
        next();
        
        function next() {
            i++;
            if (i < controllers.length) {
                callback(controllers[i], next);
            }
        }
    };
}

module.exports = Router;
