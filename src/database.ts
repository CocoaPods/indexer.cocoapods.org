import { Client } from 'pg';
import { Pod, SpecificationData } from './types';
import log from './log';
import { formatPod } from './formatPod/index';
import allPodsQuery from './all-pods.sql';

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
  specificationData: SpecificationData;
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

  log.info(`found ${rows.length} pods`);

  const pods: Pod[] = rows
    .map(({ objectID, specificationData, downloads }: Row) => ({
      objectID,
      specificationData: JSON.parse(specificationData),
      downloads,
    }))
    .map(formatPod)
    .filter(
      ({ summary }: Pod) =>
        summary && !summary.includes('Unparsable at `trunk` import time.')
    );

  log.info(`Will now index ${pods.length} pods`);

  return pods;
}
