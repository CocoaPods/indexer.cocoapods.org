import { Client } from 'pg';
import { Pod } from './types';
import log from './log';
import { formatPod } from './formatPod';

export const trunk = new Client({
  connectionString: process.env.TRUNK_DATABASE_URL,
  ssl: true,
});

export interface Row {
  objectID: string;
  specification_data: string;
  download_month: number;
  app_total: number;
}

export async function fetchAll(): Promise<Pod[]> {
  await trunk.connect();
  const { rows }: { rows: Row[] } = await trunk.query(`select 

  pods.normalized_name as "objectID", 
  specification_data,
  stats_metrics.download_month,
  stats_metrics.app_total

  from pods, pod_versions, commits, stats_metrics
  where pods.id = pod_versions.pod_id 
  and pods.id = stats_metrics.pod_id
  and commits.pod_version_id = pod_versions.id
  limit 100000`);

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
