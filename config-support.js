const fs   = require('fs');
const logr = require('em-logr');

const isValidLogLevel = level => 'trace,debug,info,warn,error,fatal'.split(',').includes(level);

const appPortCacheFile = './APP_PORT.cache';

const getPortFromFile = () => {
  if (fs.existsSync(appPortCacheFile)) {
    try {
      const portNumber = +fs.readFileSync(appPortCacheFile).toString();
      return portNumber || undefined;
    } catch (e) {
      logr.debug(e);
    }
  }
};

const savePortToFile = (portNumber) => {
  try {
    fs.writeFileSync(appPortCacheFile, portNumber);
  } catch (e) {
    logr.error(e);
    process.exit(1);
  }
};

module.exports = {
  isValidLogLevel,
  getPortFromFile,
  savePortToFile,
  get appPortCacheFile() { return appPortCacheFile; },
};
