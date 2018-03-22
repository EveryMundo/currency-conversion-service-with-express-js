// asserting this file is properly located
require('assert')(__filename.includes('/healthcheck/index.js'));

module.exports = {
  'get /info': require('./get'),
};
