describe('VPI', function () {
  var assert = require('assert');
  var express = require('express');
  var supertest = require('supertest');
  var v = require('../index');

  describe('verify', function () {

    function testVerify(opts) {
      var app = express();
      var predictedHeader = ((opts || {}).header || 'X-API-Version').toLowerCase();

      app.use(v.verify(opts));
      app.get('/', function (req, res) {
        res.json({
          v_version: req._v_version,
          req_header: req.get(predictedHeader),
          res_header: res._headers[predictedHeader],
        });
      });

      return supertest(app).get('/');
    }

    it('should assign the latest version if no header was sent', function (done) {
      testVerify()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({
          v_version: 'INF',
          req_header: 'INF',
          res_header: 'INF',
        })
        .end(done);
    });

    it('should fetch a valid semver version from a specified header', function (done) {
      testVerify({ header: 'X-Awesome-Version' })
        .set('X-Awesome-Version', '2.4.2')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({
          v_version: '2.4.2',
          req_header: '2.4.2',
          res_header: '2.4.2',
        })
        .end(done);
    });

    it('should cap a semver version if a latest is specified', function (done) {
      testVerify({ header: 'X-Awesome-Version', latest: '1.5.2' })
        .set('X-Awesome-Version', '2.4.2')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({
          v_version: '1.5.2',
          req_header: '1.5.2',
          res_header: '1.5.2',
        })
        .end(done);
    });

    it('should throw an error if the latest semver option is not valid', function () {
      assert.throws(function () { v.verify({ latest: 'one-point-five-point-six' }); }, /one-point-five-point-six/i);
    });

  });
});
