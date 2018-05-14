import { config } from 'dotenv';
config();
import log from './log.js';
import { Index } from './algolia';
import { fetchAll } from './database';
import { settings, synonyms, rules } from './settings';

log.info(
  'Welcome! We will now start indexing to',
  process.env.ALGOLIA_INDEX_NAME
);

const mainIndex = new Index(process.env.ALGOLIA_INDEX_NAME);
const bootstrapIndex = new Index(`${process.env.ALGOLIA_INDEX_NAME}-bootstrap`);

export const test = {
  isMySetupWorking: true,
};

function close() {
  log.info("That's all for now. Thanks!");
  process.exit(0);
}

async function bootstrap() {
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

  return await bootstrapIndex.waitTask(
    await bootstrapIndex.migrateTo(mainIndex)
  );
}

function watch() {
  // TODO: listen to web hooks and update things in the index
  return undefined;
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
  .then(task => log.info('Initial indexing finished', task))
  .catch(err => log.error(err, 'Initial indexing has not been completed'))
  .then(close);
