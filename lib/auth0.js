const jwksRsa = require('jwks-rsa');
const {jwt} = require('./jwt');

let _checkJwt;


/**
 * Much of this method is authored by the authors of the examples provided by the Auth0 documentation.
 * For more information, please check out https://auth0.com/docs/quickstart/backend/nodejs
 */
const getCheckJwtMiddleware = () => {
  const spring = require('./../lib/spring');

  const { issuer, audience } = spring.config.auth0;

  // Authentication middleware. When used, the
  // Access Token must exist and be verified against
  // the Auth0 JSON Web Key Set

  _checkJwt = jwt({
    // Dynamically provide a signing key based on the key in the header and the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
      jwksUri: `${issuer}.well-known/jwks.json`, // public key
    }),
    // Validate the audience and the issuer.
    audience,
    issuer,
    algorithms: ['RS256'],
  });

  return _checkJwt;
};

/**
 * Unauthorized errors; handles 401 (no credentials provided) and 403 errors (access denied)
 * and sends the appropriate response.
 * @param err
 * @param req
 * @param res
 * @param next
 */
function respondWithUnauthorizedError(err, req, res, next) {
  if (err.code === 'credentials_required') {
    res.status(401).json({err: true, reason: 'Access denied', message: err.message});
  } else if (err.name === 'UnauthorizedError') {
    res.status(403).json({err: true, reason: 'Access denied', message: 'Please check your authentication and try again.'});
  } else {
    // console.log(err);
    next(err);
  }
}

module.exports = { getCheckJwtMiddleware, respondWithUnauthorizedError };
