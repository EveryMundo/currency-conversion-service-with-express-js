
const schema = {
  description: 'It returns hello {name}',
  tags: [require('../package.json').name, 'another-tag'],
  summary: 'this is just a get request example',
  params: {
    type: 'string',
    properties: {
      name: {
        type: 'string',
        description: 'name',
      },
    },
  },
  // body: {
  //   type: 'object',
  //   properties: {
  //     hello: { type: 'string' },
  //     obj: {
  //       type: 'object',
  //       properties: {
  //         some: { type: 'string' },
  //       },
  //     },
  //   },
  // },
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        hello: { type: 'string' },
        obj: {
          type: 'object',
          properties: {
            some: { type: 'string' },
          },
        },
      },
    },
  },
  security: [
    {
      api_key: [],
    },
  ],
};
const path = '/example';

const action = (req, reply) => {
  const { name, ...rest } = req.query;

  // sending the result;
  reply.send({
    hello: name || 'world',
    obj: {
      some: JSON.stringify(rest).replace(/"/g, '\''),
    },
  });
};


const options = { schema };

module.exports = { path, action, options };
