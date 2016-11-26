var Injector = require('./injector');
var DB = require('./db');

module.exports = function(options) {

    var injector = new Injector(__dirname, require('./modules.json'));

    injector.extendLibrary({
        db: new DB(options.db)
    });

    injector.load();

    return injector.get('Connector');
};