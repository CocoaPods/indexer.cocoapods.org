import { config } from 'dotenv';
config();
import log from './log.js';
import { createIndex } from './algolia';
import { setup } from './database';

log.info(
  'Welcome! We will now start indexing to',
  process.env.ALGOLIA_INDEX_NAME
);

const index = createIndex(process.env.ALGOLIA_INDEX_NAME);

export const test = {
  isMySetupWorking: true,
};

setup();

// fetch from db and save individually
// make sure to add `objectID = name`
// index.savePods([]);
