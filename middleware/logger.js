module.exports = function() {
    return function(req, res, next) {
        console.log(req.method + ' ' + req.url.path);
        next();
    };
};