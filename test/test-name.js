module.exports = filename => filename
  .substr(filename.lastIndexOf('/') + 1)
  .replace(/[-.]test/, '')
  .replace(/^zzz_/, '')
  .replace(/(\w+)__/, '$1/');
