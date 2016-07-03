describe('VPI', function () {
  var v = require('../index');

  describe('conditions', function () {

    it('should skip cleanly if the version is missing', function (done) {
      var fn = v('>= 1.2.3', function () {
        throw new Error('Function should not have run');
      });

      fn({}, {}, done);
    });

    it('should continue cleanly if the version is INF', function (done) {
      var fn = v('>= 1.2.3', function () {
        done();
      });

      fn({ v_version: 'INF' }, {}, function () {
        throw new Error('Function should not have run');
      });
    });

    it('should skip cleanly if the version does not satisfy the condition', function (done) {
      var fn = v('>= 2.4.2', function () {
        throw new Error('Function should not have run');
      });

      fn({ v_version: '1.2.3' }, {}, done);
    });

    it('should continue cleanly if the version satisfies the condition', function (done) {
      var fn = v('>= 2.4.2', function () {
        done();
      });

      fn({ v_version: '2.6.18' }, {}, function () {
        throw new Error('Function should not have run');
      });
    });

  });
});
