var semver = require('semver');

var INF = '9999999.9999.9999';

var v = module.exports = function (condition, fn) {
  return function (req, res, next) {
    if (req.v_version && (req.v_version === 'INF' || semver.satisfies(req.v_version, condition))) fn(req, res, next);
    else next();
  };
};

v.accept = function (condition, err_props) {
  err_props = err_props || {};

  var makeError = function (err) {
    if (err_props.code) err.code = err_props.code;
    if (err_props.name) err.name = err_props.name;
    return err;
  };

  return function (req, res, next) {
    if (!req.version) {
      return next(makeError(new Error('Missing version')));
    }

    if (!semver.satisfies(req.v_version === 'INF' ? INF : req.v_version, condition)) {
      return next(makeError(new Error('Version "' + req.v_version + '" does not satisfy "' + condition + '"')));
    }

    next();
  };
};

v.satisfy = function (req, condition) {
  return !!(req.v_version && semver.satisfies(req.v_version === 'INF' ? INF : req.v_version, condition));
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
      req.v_version = semver.valid(req.get(config.header));
      if (config.latest !== 'INF' && semver.gt(req.v_version, config.latest)) req.v_version = config.latest;
    }
    else req.v_version = config.default;

    next();
  };
};
