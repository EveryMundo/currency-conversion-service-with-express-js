// asserting this file is properly located
require('assert')(__filename.includes('/convert/index.js'));

module.exports = {
  'get /convert':      require('./get'),
};
