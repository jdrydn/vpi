describe('VPI', function () {
  var assert = require('assert');
  var v = require('../index');

  describe('verify', function () {

    it('should assign the latest version if no header was sent', function (done) {
      var req = {
        get: function () {}
      };
      var verifyFn = v.verify();

      verifyFn(req, {}, function () {
        assert.equal(req.v_version, 'INF');
        done();
      });
    });

    it('should be reset if the above test is run twice', function (done) {
      var req = {
        get: function () {}
      };
      var verifyFn = v.verify();

      verifyFn(req, {}, function () {
        assert.equal(req.v_version, 'INF');
        req.v_version = 'not-a-valid-version';

        verifyFn(req, {}, function () {
          assert.equal(req.v_version, 'INF');
          done();
        });
      });
    });

    it('should fetch a valid semver version from a specified header', function (done) {
      var req = {
        get: function (key) {
          switch (key) {
            case 'X-Awesome-Version': return '2.4.2';
            default: return null;
          }
        }
      };
      var verifyFn = v.verify({
        header: 'X-Awesome-Version'
      });

      verifyFn(req, {}, function () {
        assert.equal(req.v_version, '2.4.2');
        done();
      });
    });

    it('should cap a semver version if a latest is specified', function (done) {
      var req = {
        get: function (key) {
          switch (key) {
            case 'X-Awesome-Version': return '2.4.2';
            default: return null;
          }
        }
      };
      var verifyFn = v.verify({
        header: 'X-Awesome-Version',
        latest: '1.5.2'
      });

      verifyFn(req, {}, function () {
        assert.equal(req.v_version, '1.5.2');
        done();
      });
    });

    it('should throw an error if the latest semver option is not valid', function () {
      assert.throws(function () {
        v.verify({
          latest: 'one-point-five-point-six'
        });
      }, /one-point-five-point-six/i);
    });

  });
});
