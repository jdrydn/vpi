var semver = require('semver');

var INF = '9999999.9999.9999';

var v = module.exports = function (condition, fn) {
  return function (req, res, next) {
    if (req._v_version && (req._v_version === 'INF' || semver.satisfies(req._v_version, condition))) fn(req, res, next);
    else next();
  };
};

// Could have a v.accept function?
// Which enforces a particular version number, or passes on an error.
// To be used at the start of a new router, something like:
// router.use(v.accept('>= 2.4.2', config));

v.satisfy = function (req, condition) {
  return !!(req._v_version && semver.satisfies(req._v_version === 'INF' ? INF : req._v_version, condition));
};

v.verify = function (config) {
  config = config || {};
  config.header = config.header || 'X-API-Version';
  config.latest = config.latest || 'INF';
  config.default = config.default || config.latest;

  if (config.latest !== 'INF' && !semver.valid(config.latest)) {
    throw new Error('Latest option "' + config.latest + '" is not a valid SEMVER version');
  }

  return function (req, res, next) {
    if (req.get(config.header)) {
      req._v_version = semver.valid(req.get(config.header));
      if (config.latest !== 'INF' && semver.gt(req._v_version, config.latest)) req._v_version = config.latest;
    }
    else req._v_version = config.default;

    req.headers[config.header.toLowerCase()] = req._v_version;
    res.set(config.header, req._v_version);

    next();
  };
};
