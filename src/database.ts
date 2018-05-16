import { Client } from 'pg';
import { Pod, SpecificationData } from './types';
import log from './log';
import { formatPod } from './formatPod';
import allPodsQuery from './all-pods.sql';

export const trunk = new Client({
  connectionString: process.env.TRUNK_DATABASE_URL,
  ssl: true,
});

interface Row {
  objectID: string;
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
      ({ summary }) =>
        summary && !summary.includes('Unparsable at `trunk` import time.')
    );

  log.info(`Will now index ${pods.length} pods`);

  return pods;
}
