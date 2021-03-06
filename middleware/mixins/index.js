var ResponseMixin = require('./response-mixin');

module.exports = function(connector) {
    var responseMixin = new ResponseMixin(connector);

    return function(req, res, next) {
        responseMixin.mix(res);
        next();
    };
};
