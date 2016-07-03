var semver = require('semver');

var v = module.exports = function (condition, fn) {
  return function (req, res, next) {
    if (req.v_version && (req.v_version === 'INF' || semver.satisfies(req.v_version, condition))) fn(req, res, next);
    else next();
  };
};

v.verify = function (config) {
  config = config || {};
  config.header = config.header || 'X-API-Version';
  config.latest = config.latest || 'INF';

  return function (req, res, next) {
    if (!req.v_version && req.get(config.header)) req.v_version = semver.valid(req.get(config.header));
    else if (!req.v_version) req.v_version = config.latest;

    if (semver.gt(req.v_version, config.latest)) req.v_version = config.latest;
    next();
  };
};

(function () {
  var async = null;
  try { async = require('async'); }
  catch (e) { /* Do nothing, because this is allowed */ }

  [ 'each', 'eachSeries' ].forEach(function (method) {
    v[method] = function (fns) {
      if (!async || (typeof async[method] !== 'function')) {
        throw new Error('Missing async module - install async as a dependency to use v.' + method);
      }

      var eachFn = async[method].bind(async);

      return function (req, res, next) {
        eachFn(fns.map(function (fn) {
          return async.apply(fn, req, res);
        }), next);
      };
    };
  });
})();
