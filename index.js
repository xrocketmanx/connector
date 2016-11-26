var Injector = require('./injector');

var injector = new Injector(__dirname, require('./modules.json'));
injector.load();

module.exports = injector.get('Connector');