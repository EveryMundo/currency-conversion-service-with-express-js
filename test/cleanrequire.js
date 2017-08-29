'use strict';

const cleanrequire = (path) => {
  delete require.cache[require.resolve(path)];
  return require(path);
};

module.exports = cleanrequire;
