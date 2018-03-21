// asserting this file is properly located
require('assert')(__filename.includes('/info/index.js'));

module.exports = {
  'get /info': require('./get'),
};
