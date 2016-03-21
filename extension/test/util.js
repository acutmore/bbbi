var assert = require('assert');
var requirejs = require('requirejs');

requirejs.config({
    baseUrl: 'src',
    nodeRequire: require
});

describe('Util', function() {

  var Util, util;

  before(function(done) {
      requirejs(['util/util'], function(u) {
          Util = u;
          done();
      });
  });

  beforeEach(function() {
    util = new Util();
  });

  describe('#nthIndexOfSubString', function () {

    it('should return -1 when the substring is not present', function () {
      assert.equal(-1, util.nthIndexOfSubString('foo', 'bar')) ;
      assert.equal(-1, util.nthIndexOfSubString('', 'bar')) ;
      assert.equal(0, util.nthIndexOfSubString('foo', '')) ;
    });

    it('should return 0 when the substring is empty', function () {
      assert.equal(0, util.nthIndexOfSubString('foo', '')) ;
      assert.equal(0, util.nthIndexOfSubString('foo', '', 2)) ;
    });

    it('should return the index of the 1st occurence of the substring with n == undefined', function () {
      assert.equal(0, util.nthIndexOfSubString('foo foo', 'foo')) ;
    });

    it('should return the index of the 2nd occurence of the substring with n == 1', function () {
      assert.equal(4, util.nthIndexOfSubString('foo foo', 'foo', 1)) ;
    });

  });

  describe('#getURLParameter', function () {

    it('should return undefined when the parameter is missing', function () {
      assert.equal(undefined, util.getURLParameter('http://foo.com', 'bar')) ;
    });

    it('should return the value of the parameter', function () {
      assert.equal("value", util.getURLParameter('http://foo.com/?param=value', 'param')) ;
    });

  });

  describe('#URLToArray', function () {

    it('should split the url parameters into an array', function () {
      assert.deepEqual([ ['p', 'v'], ['p', 'v'] ], util.URLToArray('http://foo.com/?p=v&p=v')) ;
    });

  });

});
