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

const bootstrapFrequency = ms('1 day');

function close() {
  log.info('So Long, and Thanks for All the Fish!');
  process.exit(0);
}

export async function bootstrap() {
  if (mainIndex.state === undefined) {
    throw new Error(
      `Main index ${mainIndex.indexName} did not have index state`
    );
  }
  await mainIndex.state.save({ bootstrapDidFinish: false });
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
  await mainIndex.state.save({
    bootstrapDidFinish: true,
    bootstrapLastFinished: new Date().getTime(),
  });

  log.info('Bootstrap indexing finished');
}

const sleep = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time));

async function watch() {
  // TODO: listen to webhooks and update things in the index
  log.info(
    `Webhooks are not yet implemented, so instead we will now wait for`,
    ms(bootstrapFrequency, { long: true }),
    `, then we will crash and let the autorestarting take over`
  );
  await sleep(bootstrapFrequency);
}

async function shouldRedoBootstrap() {
  if (mainIndex.state === undefined) {
    throw new Error(
      `Main index ${mainIndex.indexName} did not have index state`
    );
  }
  const {
    bootstrapDidFinish,
    bootstrapLastFinished,
  } = await mainIndex.state.get();
  const currentTime = new Date().getTime();
  const timeDiff = currentTime - bootstrapLastFinished;
  const shouldRedo =
    (bootstrapDidFinish && timeDiff > bootstrapFrequency) ||
    timeDiff > 2 * bootstrapFrequency;

  log.info(`Should we redo indexing ? ${shouldRedo ? 'yes' : 'no'}`, {
    bootstrapDidFinish,
    currentTime,
    bootstrapLastFinished,
    timeDiff,
    bootstrapFrequency,
    shouldRedo,
  });

  return shouldRedo;
}

async function main() {
  if (mainIndex.state === undefined) {
    throw new Error(
      `Main index ${mainIndex.indexName} did not have index state`
    );
  }
  await mainIndex.state.check();

  if (await shouldRedoBootstrap()) {
    await bootstrap();
  }

  return watch();
}

main()
  .then(() => log.info('Indexing terminated'))
  .catch(err => log.error(err, 'An error happened while indexing'))
  .then(close);
