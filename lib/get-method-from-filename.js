const path = require('path');

module.exports = filename => path.basename(filename).replace(path.extname(filename), '').toUpperCase();
