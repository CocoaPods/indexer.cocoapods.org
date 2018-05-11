import { config } from 'dotenv';
config();

console.log('indexName', process.env.ALGOLIA_INDEX_NAME);
console.log('hi from TS');

export const test = {
  isMySetupWorking: true,
};
