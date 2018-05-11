const bunyan = require('bunyan');
const log = bunyan.createLogger({
  name: process.env.ALGOLIA_INDEX_NAME || 'unknown',
});
module.exports = log;
