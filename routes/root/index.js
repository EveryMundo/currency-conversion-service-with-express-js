// asserting this file is properly located
require('assert')(__filename.includes('/root/index.js'));

module.exports = {
  'get /': require('./get'),
};
