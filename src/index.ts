import { config } from 'dotenv';
config();
import log from './log.js';
import { Index } from './algolia';
import { trunk } from './database';
import { Pod, SpecificationData } from './types';
import { settings, synonyms, rules } from './settings';
import { formatPod } from './formatPod';

log.info(
  'Welcome! We will now start indexing to',
  process.env.ALGOLIA_INDEX_NAME
);

const mainIndex = new Index(process.env.ALGOLIA_INDEX_NAME);
const bootstrapIndex = new Index(`${process.env.ALGOLIA_INDEX_NAME}-bootstrap`);

export const test = {
  isMySetupWorking: true,
};

const fetchAllQuery = `select 

pods.normalized_name as "objectID", 
specification_data

from pods, pod_versions, commits 
where pods.id = pod_versions.pod_id 
and commits.pod_version_id = pod_versions.id
limit 100000`;

export type Row = { objectID: string; specification_data: string };

async function fetchAll(): Promise<Pod[]> {
  await trunk.connect();
  const { rows }: { rows: Row[] } = await trunk.query(fetchAllQuery);

  log.info(`found ${rows.length} pods`);

  const pods: Pod[] = rows
    .map(formatPod)
    .filter(
      ({ summary }) =>
        summary && !summary.includes('Unparsable at `trunk` import time.')
    );

  log.info(`Will now index ${pods.length} pods`);

  return pods;
}

function close() {
  log.info("That's all for now. Thanks!");
  process.exit(0);
}

async function main() {
  // add here: do the bootstrap only after X amount of time

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
  // add here: listening for changes
}

main()
  .then(task => log.info('Initial indexing finished', task))
  .catch(err => log.error(err, 'Initial indexing has not been completed'))
  .then(close);
