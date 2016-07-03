var semver = require('semver');

var v = module.exports = function (condition, fn) {
  return function (req, res, next) {
    if (req.v_version && (req.v_version === 'INF' || semver.satisfies(req.v_version, condition))) fn(req, res, next);
    else next();
  };
};

// Could have a v.accept function?
// Which enforces a particular version number, or passes on an error.
// To be used at the start of a new router, something like:
// router.use(v.accept('>= 2.4.2', config));

v.verify = function (config) {
  config = config || {};
  config.header = config.header || 'X-API-Version';
  config.latest = config.latest || 'INF';

  return function (req, res, next) {
    if (req.get(config.header)) {
      req.v_version = semver.valid(req.get(config.header));
      if (config.latest !== 'INF' && semver.gt(req.v_version, config.latest)) req.v_version = config.latest;
    }
    else req.v_version = config.latest;

    next();
  };
};

(function () {
  /**
   * This exposes the SERIES & PARALLEL methods of async for convienience, so you can easily stack middlewares.
   */
  var async = null;
  try { async = require('async'); }
  catch (e) { /* Do nothing, because this is allowed */ }

  [ 'series', 'parallel' ].forEach(function (method) {
    v[method] = function (fns) {
      /* istanbul ignore if */
      if (!async || (typeof async[method] !== 'function')) {
        throw new Error('Missing async module - install async as a dependency to use v.' + method);
      }

      return function (req, res, next) {
        async[method].call(async, fns.map(function (fn) {
          return async.apply(fn, req, res);
        }), next);
      };
    };
  });
})();
