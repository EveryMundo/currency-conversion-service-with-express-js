// asserting this file is properly located
require('assert')(__filename.includes('/example/index.js'));

module.exports = {
  'get /example': require('./get'),
};
