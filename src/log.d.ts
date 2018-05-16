import * as bunyan from 'bunyan';

const log = bunyan.createLogger({
  name: process.env.ALGOLIA_INDEX_NAME || 'unknown',
  level: process.env.LOG_LEVEL || 'INFO',
});
export default log;
