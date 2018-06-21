import { Client } from 'pg';
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

export async function fetchAll(): Promise<Pod[]> {
  log.info('Commencing query for all pods');
  await trunk.connect();
  const { rows }: { rows: Row[] } = await trunk.query(allPodsQuery);

  log.info(`Found ${rows.length} pods`);

  const pods: Pod[] = rows
    .map(({ objectID, specificationData, downloads }: Row) => ({
      objectID,
      specificationData: JSON.parse(specificationData),
      downloads,
    }))
    .map(formatPod);

  log.info(`Will now index ${pods.length} pods`);

  return pods;
}
