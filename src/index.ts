import { config } from 'dotenv';
config();
import log from './log.js';
import { Index } from './algolia/index';
import { fetchAll } from './database';
import { settings, synonyms, rules } from './settings';
import ms from 'ms';

interface IndexState {
  bootstrapLastFinished: number;
  bootstrapDidFinish: boolean;
}
const defaultState: IndexState = {
  bootstrapLastFinished: 0,
  bootstrapDidFinish: true,
};

const mainIndex = new Index<IndexState>({
  indexName: process.env.ALGOLIA_INDEX_NAME,
  defaultState,
});
const bootstrapIndex = new Index<IndexState>({
  indexName: `${process.env.ALGOLIA_INDEX_NAME}-bootstrap`,
});

log.info(
  'Welcome! We will now start indexing to',
  mainIndex.indexName,
  'and',
  bootstrapIndex.indexName
);

const mainIndex = new Index(process.env.ALGOLIA_INDEX_NAME);
const bootstrapIndex = new Index(`${process.env.ALGOLIA_INDEX_NAME}-bootstrap`);

function close() {
  log.info('So Long, and Thanks for All the Fish!');
  process.exit(0);
}

export async function bootstrap() {
  await bootstrapIndex.waitTask(await bootstrapIndex.destroy());

  await bootstrapIndex.waitTask(
    await bootstrapIndex.savePods(await fetchAll())
  );

  await bootstrapIndex.waitTask(
    await bootstrapIndex.setAllSettings({
      settings,
      synonyms,
      rules,
    })
  );

  await bootstrapIndex.waitTask(await bootstrapIndex.migrateTo(mainIndex));
  log.info('Bootstrap indexing finished');
}

const sleep = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time));

async function watch() {
  // TODO: listen to webhooks and update things in the index
  log.info(
    'Webhooks are not yet implemented, so instead we will now wait for 1 day'
  );
  await sleep(ms('1 day'));
}

function shouldRedoBootstrap() {
  // TODO: check a stored time for last complete bootstrap vs time now
  // redo if over a certain threshold
  return true;
}

async function main() {
  if (shouldRedoBootstrap()) {
    await bootstrap();
  }

  return watch();
}

main()
  .then(() => log.info('Indexing terminated'))
  .catch(err => log.error(err, 'An error happened while indexing'))
  .then(close);
