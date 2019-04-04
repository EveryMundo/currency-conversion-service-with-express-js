const { expect } = require('chai');

const { loadConfig } = require('../lib/spring');


describe('spring config', () => {
  context('$getConfig', () => {
    it('should successfully get the spring config', () => {
      const spring = loadConfig();
      expect(spring).to.not.be.undefined;
    });
  });
});
