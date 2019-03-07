const _jwt = require('express-jwt');

/**
 * Wrapper for express-jwt module method. Is the thinnest kind of wrappers, and is kept that way
 * to allow for easier stubbing in tests.
 */
const jwt = (...args) => _jwt(...args);

module.exports = { jwt };
