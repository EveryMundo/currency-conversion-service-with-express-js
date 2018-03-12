const setGlobalRootDir = () => {
  if (global.__rootdir) return;

  const path = require('path');
  const value = path.dirname(path.dirname(__filename));

  return Object.defineProperty(global, '__rootdir', { value });
};

module.exports = { setGlobalRootDir };
