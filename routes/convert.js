'use strict';

const data = require('../data').update();

const path = '/convert';

const action = (req, reply) => {
  const {value, from, to} = req.query;

  // getting the usdValue first
  const usdValue = value / data.rates[from];

  // calculating the conversion value
  const result = usdValue * data.rates[to];

  // sending the result;
  reply.send({
    value, from, to, result,
  });
};

const beforeHandler = (req, res, next) => {
  const {query} = req;

  query.value = +query.value;
  query.from  = ('' + query.from).toUpperCase();
  query.to    = ('' + query.to).toUpperCase();

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(query.value)) return next(new Error(`Invalid value '${query.value}'`));
  if (!(query.from in data.rates)) return next(new Error(`Unkown currency code '${query.from}' in from`));
  if (!(query.to   in data.rates)) return next(new Error(`Unkown currency code '${query.to}' in to`));

  next();
};

const schema = {
  response: {
    200: {
      type: 'object',
      properties: {
        value:  { type: 'number' },  // 10
        from:   { type: 'string' },  // "BRL"
        to:     { type: 'string' },  // "BBD"
        result: { type: 'number' },  // 6.347586203394435
      },
    },
  },
};

const options = {schema, beforeHandler};

module.exports = {path, action, options};
