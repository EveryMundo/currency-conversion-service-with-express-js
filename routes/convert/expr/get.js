'use strict';

// asserting this file is properly located
require('assert')(__filename.includes('/convert/expr/get.js'));

const url = '/convert/:expr';

// const method = require(`${global.__rootdir}/lib/get-method-from-filename`)(__filename);

const {
  handler,
  schema,
  method,
} = require('../get');

const exprRegExp = /(\d+(?:\.\d+)?)[-\s]+from[-\s]+([A-Z]{3})[-\s]+to[-\s]+([A-Z]{3})/;

const beforeHandler = (req, res, next) => {
  const { params } = req;

  const match = params.expr.match(exprRegExp);

  if (!match) return next(new Error(`Invalid expression '${params.expr}'`));

  const [, value, from, to] = match;

  req.query = {value: +value, from, to};

  next();
};


module.exports = { url, beforeHandler, handler, schema, method };
