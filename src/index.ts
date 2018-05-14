import { config } from 'dotenv';
config();
import log from './log.js';
import { Index } from './algolia';
import { trunk } from './database';
import { IndexablePod } from './types.js';

log.info(
  'Welcome! We will now start indexing to',
  process.env.ALGOLIA_INDEX_NAME
);

const index = new Index(process.env.ALGOLIA_INDEX_NAME);

export const test = {
  isMySetupWorking: true,
};

const fetchAllQuery = `select 

pods.normalized_name as "objectID", 
specification_data

from pods, pod_versions, commits 
where pods.id = pod_versions.pod_id 
and commits.pod_version_id = pod_versions.id
limit 100`;

async function fetchAll(): Promise<IndexablePod[]> {
  await trunk.connect();
  const { rows } = await trunk.query(fetchAllQuery);

  const pods: IndexablePod[] = rows
    .map(({ objectID, specification_data }) => {
      const specificationData = JSON.parse(specification_data);
      const authors = Object.entries(specificationData.authors || {}).map(
        ([name, email]) => ({
          name,
          email,
        })
      );

      return {
        ...specificationData,
        objectID,
        authors,
      };
    })
    .filter(
      ({ summary }) =>
        summary && !summary.includes('Unparsable at `trunk` import time.')
    );

  return pods;
}

async function main() {
  return index.savePods(await fetchAll());
}

main()
  .then(({ taskID }) => log.info('Initial indexing finished', { taskID }))
  .catch(err => log.error(err, 'Initial indexing has not been completed'));
