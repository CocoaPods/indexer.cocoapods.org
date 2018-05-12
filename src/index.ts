import { config } from 'dotenv';
config();
import log from './log.js';
import { setup } from './database';

log.info('indexName', process.env.ALGOLIA_INDEX_NAME);
log.info('hi from TS');

export const test = {
  isMySetupWorking: true,
};

setup();
