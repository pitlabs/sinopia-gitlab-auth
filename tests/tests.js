var plugin = require('../');
var assert = require('assert');
var express = require('express');

describe('auth plugin', function() {
    const stuff = null;

    it('should have plugin interface', function() {
        assert.equal(typeof plugin, 'function')
        var p = plugin({url: ''}, stuff)
        assert.equal(typeof p.authenticate, 'function')
        assert.equal(typeof p.addUser, 'function')
    });

    describe('using fake server', function(){
        var p = plugin({url: 'http://localhost:8099/'}, stuff);

        var fakeServer = express();

        before(function(cb){
            fakeServer.get('/api/v4/user', function(req, res){
                var pat = req.query['private_token'];
                if(pat != 'bar'){
                    res.status(401).send();
                }
                else{
                    res.json({"username":"foo"});
                }
            });

            fakeServer.get('/api/v4/groups', function(req, res){
                var pat = req.query['private_token'];
                if(pat != 'bar'){
                    res.status(401).send();
                }
                else{
                    res.json([{"path":"CAMPUS_Legacy"},{"path":"PIT_Labs"},{"path":"Spielwiese"}]);
                }
            });

            fakeServer.listen(8099, cb);
        });

        it('should authenticate user', function(cb) {
            p.authenticate('foo', 'bar', function(err, groups) {
                assert(!err);
                assert.deepEqual(groups, ['foo', 'CAMPUS_Legacy', 'PIT_Labs', 'Spielwiese']);
                cb();
            });
        });

        it('should fail for wrong user', function(cb) {
            p.authenticate('bar', 'bar', function(err, groups) {
                assert(!err);
                assert(!groups);
                cb();
            });
        });

        it('should fail for wrong PAT', function(cb) {
            p.authenticate('foo', 'baz', function(err, groups) {
                assert(!err);
                assert(!groups);
                cb();
            });
        });
    });
});