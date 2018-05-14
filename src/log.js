const bunyan = require('bunyan');
require('dotenv').config();

const log = bunyan.createLogger({
  name: process.env.ALGOLIA_INDEX_NAME || 'unknown',
  level: process.env.LOG_LEVEL || 'INFO',
});
module.exports = log;
