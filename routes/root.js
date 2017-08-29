'use strict';

const data = require('../data');

const path = '/';

const action = (req, reply) => {
  reply.send(data);
};

const schema = {
  response: {
    200: {
      type: 'object',
      properties: {
        _id:         { type: 'string' },
        __v:         { type: 'string' },
        __createdAt: { type: 'string' },
        timestamp:   { type: 'string' },
        source:      { type: 'string' },
        date:        { type: 'string' },
        rates:       { type: 'object' },
      },
    },
  },
};

const options = {schema};

module.exports = {path, action, options};
