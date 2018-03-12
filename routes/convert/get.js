'use strict';

// asserting this file is properly located
require('assert')(__filename.includes('/convert/get.js'));

const data = require('../../data').update();

const url = '/convert';

const method = require(`${global.__rootdir}/lib/get-method-from-filename`)(__filename);

const handler = (req, reply) => {
  const {value, from, to} = req.query;

  // getting the usdValue first
  const usdValue = value / data.rates[from];
  // calculating the conversion value
  const result = usdValue * data.rates[to];

  const fixed = result.toFixed(2);

  // sending the result;
  reply.send({
    value, from, to, result, fixed,
  });
};

const beforeHandler = (req, res, next) => {
  const {query} = req;

  query.value = +query.value;
  query.from  = ('' + query.from).toUpperCase();
  query.to    = ('' + query.to).toUpperCase();

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(query.value)) return next(new Error(`Invalid value [${query.value}]`));
  if (!(query.from in data.rates)) return next(new Error(`Unkown currency code [${query.from}] in from`));
  if (!(query.to   in data.rates)) return next(new Error(`Unkown currency code [${query.to}] in to`));

  next();
};

const schema = {
  description: 'It returns the value converted',
  tags: [require(`${global.__rootdir}/package.json`).name],
  summary: 'Currency conversion method',
  response: {
    200: {
      type: 'object',
      properties: {
        value:  { type: 'number' },  // 10
        from:   { type: 'string' },  // "BRL"
        to:     { type: 'string' },  // "BBD"
        result: { type: 'number' },  // 6.347586203394435
        fixed:  { type: 'number' },  // 6.35
      },
    },
  },
};

module.exports = { url, beforeHandler, handler, schema, method };
