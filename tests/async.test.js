describe('VPI', function () {
  var assert = require('assert');
  var v = require('../index');

  describe('async', function () {

    it('should run in sequence', function (done) {
      var count = 0;
      var fns = [];
      var max = 5;

      var incrFn = function (req, res, next) {
        count++;
        next();
      };

      for (var i = 1; i <= max; i++) {
        fns.push(incrFn);
      }

      v.series(fns).call(null, {}, {}, function (err) {
        if (err) return done(err);

        assert.equal(count, max);
        done();
      });
    });

  });
});
