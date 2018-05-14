import { Client } from 'pg';
import { Pod, SpecificationData } from './types';
import log from './log';
import { formatPod } from './formatPod';

export const trunk = new Client({
  connectionString: process.env.TRUNK_DATABASE_URL,
  ssl: true,
});

interface Row {
  normalizedName: string;
  specificationData: string;
  downloads: {
    lastMonth: number;
    total: number;
    appsTouched: number;
  };
}

export interface ParsedRow {
  objectID: string;
  specificationData: SpecificationData;
  downloads: {
    lastMonth: number;
    total: number;
    appsTouched: number;
  };
}

export async function fetchAll(): Promise<Pod[]> {
  await trunk.connect();
  const { rows }: { rows: Row[] } = await trunk.query(`select 

  pods.normalized_name as "normalizedName",
  specification_data AS "specificationData",
  json_build_object(
    'lastMonth', stats_metrics.download_month,
    'total', stats_metrics.download_total,
    'appsTouched',stats_metrics.app_total) AS downloads

  FROM pods,
    pod_versions,
    commits,
    stats_metrics

  WHERE pods.id = pod_versions.pod_id
    AND pods.id = stats_metrics.pod_id
    AND commits.pod_version_id = pod_versions.id
    AND NOT pods.deleted

  limit 100000`);

  log.info(`found ${rows.length} pods`);

  const pods: Pod[] = rows
    .map(({ normalizedName, specificationData, downloads }: Row) => ({
      // TODO: should we get only one version based on the last semver?
      // or just last published?
      objectID: `${normalizedName}-${JSON.parse(specificationData).version}`,
      specificationData: JSON.parse(specificationData),
      downloads,
    }))
    .map(formatPod)
    .filter(
      ({ summary }) =>
        summary && !summary.includes('Unparsable at `trunk` import time.')
    );

  log.info(`Will now index ${pods.length} pods`);

  return pods;
}
