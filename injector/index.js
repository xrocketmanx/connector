var path = require('path');

function Injector(dir, config) {
    var modules = {};

    this.get = function(moduleName) {
        return modules[moduleName];
    };

    this.addModules = function(_modules) {
        for (var i in _modules) {
            modules[i] = _modules[i];
        }
    };

    this.load = function() {
        for (var name in config) {
            resolveModule(name);
        }
        return this;
    };

    function resolveModule(name) {
        if (!modules[name]) {
            var modulePath = path.join(dir, config[name]);
            var module = require(modulePath);

            if (module.inject) {
                var required = getArguments(module.toString());
                required = required.map(function(arg) {
                    if (!modules[arg]) {
                        resolveModule(arg);
                    }
                    return modules[arg];
                });
                modules[name] = module.apply(null, required);
            } else {
                modules[name] = module;
            }
        }
    }

    var argsPattern = /\((.*)\)/;
    function getArguments(module) {
        return module.match(argsPattern)[1].split(/,\s*/);
    }
}

module.exports = Injector;

/*
Config: {
    Name: path
}
 */
