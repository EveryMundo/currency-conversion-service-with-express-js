
const path   = require('path');
const assert = require('assert');

assert(/\/test$/.test(__dirname), `${__dirname} does not end in /test`);

require('dotenv').load({path: path.join(__dirname, '.env')});

require('@everymundo/global-root-dir').setGlobalRootDir(path.dirname(path.dirname(__filename)));
