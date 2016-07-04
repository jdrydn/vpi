describe('VPI', function () {
  var assert = require('assert');
  var v = require('../index');

  describe('satisfy', function () {

    it('should return false if no version was set', function () {
      assert.equal(v.satisfy({}, '^1.2.3'), false);
    });

    it('should return true if the version is INF', function () {
      assert.equal(v.satisfy({ v_version: 'INF' }, '^1.2.3'), false);
    });

    it('should return true if the version satisfies the condition', function () {
      assert.equal(v.satisfy({ v_version: '1.2.3' }, '^1.2.1'), true);
    });

    it('should return false if the version does not satisfy the condition', function () {
      assert.equal(v.satisfy({ v_version: '1.2.2' }, '~1.2.3'), false);
    });

  });
});
