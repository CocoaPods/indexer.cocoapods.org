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

const latest_version_query =
    //Reference: https://gist.github.com/jugutier/62d1da6fc8edc3d6efe88223b33f5032
    `
select

latest_version_per_pod.pod_id,
all_pods.specification_data

from

				-- Q1
				(
				
					select 
					latest_version,
					pod_versions.id as version_id,
					latest_pods.pod_id
					
					from pod_versions
					join
					
					(
					
						select max(pod_versions.name) as latest_version , 
						        pod_id 
						        
						from pod_versions
						group by pod_id
					
					) as latest_pods
					
					on
					pod_versions.pod_id = latest_pods.pod_id
					and
					pod_versions.name = latest_pods.latest_version
				
				
				) as latest_version_per_pod

left join lateral 

			--Q2
			(
			
						select pod_versions.name as version, 
							   commits.specification_data,
							   pod_versions.pod_id,
							   pod_versions.id as version_id
						from commits
						join pod_versions
						on commits.pod_version_id = pod_versions.id
						where 
						pod_versions.pod_id = latest_version_per_pod.pod_id
						and 
						version_id = latest_version_per_pod.version_id
						limit 1
			
			)  as all_pods


on true
`

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
    stats_metrics,
    (${latest_version_query}) as latest_version_query

  WHERE pods.id = latest_version_query.pod_id
    AND pods.id = stats_metrics.pod_id
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
