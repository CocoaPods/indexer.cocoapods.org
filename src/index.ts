import { config } from 'dotenv';
config();
import log from './log.js';
import { Index } from './algolia';
import { trunk, setup } from './database';

log.info(
  'Welcome! We will now start indexing to',
  process.env.ALGOLIA_INDEX_NAME
);

const index = new Index(process.env.ALGOLIA_INDEX_NAME);

export const test = {
  isMySetupWorking: true,
};

//setup();

// fetch from db and save individually
// make sure to add `objectID = name`
// index.savePods([]);


const sqlQuery =
  `select 

pods.normalized_name as objectID, 
specification_data

from pods, pod_versions, commits 
where pods.id = pod_versions.pod_id 
and commits.pod_version_id = pod_versions.id
limit 100`;

trunk.connect()
trunk.query(sqlQuery, (err, res) => {

  //1. Capitalize objectid to objectID because pg returns lowercase json
  res.rows.map(current => {
    current['objectID'] = current['objectid'];
    delete current['objectid'];
  })
  //2. Reject pods that don't contain a json summary
  res.rows = res.rows.filter(current => {
    current = JSON.parse(current.specification_data)["summary"]
    return current && !current.includes("Unparsable at `trunk` import time.")
  });
  index.savePods(res.rows);

})