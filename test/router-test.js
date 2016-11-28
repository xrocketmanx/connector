var assert = require('assert');
var Router = require('../router');

describe('Router', function() {
    describe('#get()', function() {
        var router = new Router();

        it('should get object by simple path', function() {
            router.set('test', 1);
            assert.deepEqual(router.get('test')[0].controllers, [1]);
        });

        it('should get object by matching regexp', function() {
            router.set('file/\\w{3}/', 1);
            assert.deepEqual(router.get('file/abc/')[0].controllers, [1]);
        });

        it('should get multiple objects of one route with keeping order', function() {
            router.set('tiny', 1);
            router.set('tiny', 2);
            assert.deepEqual(router.get('tiny')[0].controllers, [1, 2]);
        });
        
        it('should get multiple objects of different routes with keeping order', function() {
            router.set('multiple', 1);
            router.set('multiple', 3);
            router.set('multiple/second', 2);
            var routes = router.get('multiple/second');
            assert.deepEqual(routes[0].controllers, [1, 3]);
            assert.deepEqual(routes[1].controllers, [2]);
        });
        
        it('should get matched route names', function() {
            router.set('name', 1);
            router.set('name/second', 1);
            var routes = router.get('name/second');
            assert.equal(routes[0].name, 'name');
            assert.equal(routes[1].name, 'name/second');
        });

        it('should get path params', function() {
            router.set('params/:name', 1);
            assert.equal(router.get('params/alex')[0].params.name, 'alex');
            assert.equal(router.get('params/25')[0].params.name, '25');
        });
    });
});
