/**
 * Matches controllers by path
 * and parses it`s params
 * @constructor
 */
function Router() {
    var routes = {};

    /**
     * Sets controller to be matched by route
     * @param {string} route regexp string
     * @param {Object} controller
     */
    this.set = function(route, controller) {
        if (!routes[route]) {
            routes[route] = {
                meta: parseRoute(route),
                controllers: []
            };
        }
        routes[route].controllers.push(controller);
    };

    /**
     * Gets controllers associated with path
     * and parsed path params
     * @param {string} path
     * @returns {Array} array of objects
     * with keys - controllers, params, key
     */
    this.get = function(path) {
        var matchedRoutes = [];
        for (var key in routes) {
            var route = routes[key];
            var matches = matchRoute(route.meta, path);
            if (matches) {
                matchedRoutes.push({
                    controllers: route.controllers,
                    params: matches,
                    name: key
                });
            }
        }
        return matchedRoutes;
    };
    
    function parseRoute(route) {
        var PARAMS_PATTERN = /:(\w+)/g;
        var matches = (route.match(PARAMS_PATTERN) || []).map(function(m) {
            return m.slice(1);
        });
        return {
            params: matches,
            pattern: new RegExp(route.replace(PARAMS_PATTERN, '(\\w+)'))
        };
    }

    function matchRoute(route, path) {
        var matches = path.match(route.pattern);
        if (matches) {
            return route.params.reduce(function(obj, param, i) {
                obj[param] = matches[i + 1];
                return obj;
            }, {});
        } else {
            return null;
        }
    }
}

module.exports = Router;
