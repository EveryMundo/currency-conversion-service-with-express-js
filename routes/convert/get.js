'use strict';

// asserting this file is properly located
require('assert')(__filename.includes('/convert/get.js'));

const data = require('../../data').data;

const url = '/convert';

const method = require(`${global.__rootdir}/lib/get-method-from-filename`)(__filename);

const handler = (req, reply) => {
  try {
    const {value, from, to} = req.params;

    if (value === undefined || from === undefined || to === undefined) {
      reply.status(400);
      reply.json({err: 'bad inputs'});
    }

    // getting the usdValue first
    const usdValue = value / data.rates[from];
    // calculating the conversion value
    const result = usdValue * data.rates[to];

    const fixed = result.toFixed(2);

    // sending the result;
    reply.json({
      value, from, to, result, fixed,
    });
  } catch (error) {
    reply.status(400);
    reply.json(error);
  }
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

module.exports = { url, handler, schema, method };
