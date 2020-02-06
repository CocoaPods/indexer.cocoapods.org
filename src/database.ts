import { Client } from 'pg';
import Cursor from 'pg-cursor';
import { Pod, SpecificationData } from './types';
import log from './log';
import { formatPod } from './formatPod/index';

const allPodsQuery = `
WITH latest_version AS (
  SELECT id, pod_id FROM (
    SELECT
      id,
      pod_id,
      rank() OVER (PARTITION by pod_id ORDER BY created_at desc) AS version_rank
      FROM pod_versions
    ) AS ranked_versions
  WHERE version_rank = 1
)

SELECT
  pods.normalized_name AS "objectID",
  commits.specification_data AS "specificationData",
  json_build_object(
    'lastMonth', stats_metrics.download_month,
    'total', stats_metrics.download_total,
    'appsTouched', stats_metrics.app_total
  ) AS downloads

FROM pods
LEFT JOIN latest_version ON latest_version.pod_id = pods.id
LEFT JOIN stats_metrics ON stats_metrics.pod_id = pods.id
LEFT JOIN commits ON commits.pod_version_id = latest_version.id
`;

export const trunk = new Client({
  connectionString: process.env.TRUNK_DATABASE_URL,
  ssl: true,
});

interface Row {
  objectID: string;
  /**
   * JSON string of SpecificationData
   */
  specificationData: string;
  downloads: {
    lastMonth: number;
    total: number;
    appsTouched: number;
  };
}

export interface ParsedRow {
  objectID: string;
  specificationData?: SpecificationData | {};
  downloads: {
    lastMonth: number;
    total: number;
    appsTouched: number;
  };
}

export async function fetchAll(onBatch: (pods: Pod[]) => void) {
  log.info('Commencing query for all pods');
  await trunk.connect();
  // TS: the cursor api seems to change the return of query to be itself
  // let's leave it as `any` for now.
  const cursor: any = trunk.query(new Cursor<Row>(allPodsQuery) as any);

  type PromiseCallbackParameters = Parameters<
    ConstructorParameters<typeof Promise>[0]
  >;
  type Resolve = PromiseCallbackParameters[0];
  type Reject = PromiseCallbackParameters[0];

  function batch(resolve: Resolve, reject: Reject) {
    cursor.read(10000, (err: Error | undefined, rows: Row[]) => {
      if (err) {
        reject(err);
      }

      if (rows.length === 0) {
        resolve();
        return;
      }

      log.info(`Found ${rows.length} pods`);

      const pods: Pod[] = rows
        .map(({ objectID, specificationData, downloads }: Row) => ({
          objectID,
          specificationData: JSON.parse(specificationData),
          downloads,
        }))
        .map(formatPod);

      onBatch(pods);
      batch(resolve, reject);
    });
  }

  return new Promise(batch);
}
