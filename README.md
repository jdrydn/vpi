# V

After reading [this excellent article from Netflix about scaling & versioning][netflix-medium-post], and also from
experience, it's safe to say that writing a versioned API is a pain. Supporting older "legacy" clients is tedious and
often leads to unexpected behaviour. You end up with split URL paths like `/v1` & `/v2`, and having to update clients
(especially clients following an app-store model) becomes impossible since the URLs are fixed.

`v` attempts to solve this problem by offering you a way to semantically version the incoming requests accordingly, and
offers an easy programmable way to control your logic across API versions :sunglasses:

This would not be possible without the [Semver package from NPM][semver-npm], so a big thank you to them :thumbsup:

```js
var express = require('express');
var v = require('vpi');

var app = express();
app.use(v.verify());

app.use('/users', v('>= 2.0.0', require('./v2/users')));
app.use('/users', v('>= 1.0.0 && < 2.0.0', require('./v1/users')));
```

Then all you need to do is send a fixed version with your request:

```http
GET /users HTTP/1.1
X-API-Version: 1.2.1
```

This can be a consistent version across all the requests from the client, or each request can have it's own iterations
& version numbers. That's entirely up to you! It's your client & your codebase, you know what is best for you!!

Omitting the version sets the version to `INF`, which is considered to be the maximum potential version available.
Statements looking for versions **greater** than a condition will be always be true, and statements looking for
versions **less than** a condition will always be false.

## Usage

```
v([condition], [handler])
```

The condition is [any range that Semver accepts][semver-ranges], and the handler is your standard `(req, res, next)`
function (including Express routes, etc), just like similar routing packages like [vhost][vhost-npm].

## Verify

The `verify` method is a middleware that should be called early on. It ensures that `req.v_version` will be set to a
valid version, either one specified by the client or the maximum version. It accepts an object of options to customise
how and which version will be set on a per-request basis:

| Property | Description |
| ---- | ---- |
| `header` | The name of the request header where the version is being sent |
| `latest` | Manually set the latest version that the middleware will fall back to |

```js
app.use(v.verify({
  header: 'X-Client-Version'
  latest: '2.4.2'
}));
```

[netflix-medium-post]: https://medium.com/@nodejs/netflixandchill-how-netflix-scales-with-node-js-and-containers-cf63c0b92e57#.svecljpvr
[semver-npm]: https://www.npmjs.com/package/semver
[semver-ranges]: https://www.npmjs.com/package/semver#ranges
[vhost-npm]: https://www.npmjs.com/package/vhost
