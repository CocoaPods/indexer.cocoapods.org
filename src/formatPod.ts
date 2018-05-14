import { SpecificationData, Pod } from './types';
import log from './log';
import { Row } from './index';

export function formatPod({ objectID, specification_data }: Row): Pod {
  const specificationData: SpecificationData = JSON.parse(specification_data);

  log.debug('Now transforming', objectID, { specificationData });

  const authors = getAuthors(specificationData);
  const license = getLicense(specificationData);
  const summary = truncate(specificationData.summary, 500);
  const source = deHash<{ git: string; tag: string }>(specificationData.source);
  const {
    name,
    version,
    homepage,
    platforms,
    source_files,
    requires_arc,
    swift_version,
  } = specificationData;

  return {
    objectID,
    name,
    version,
    summary,
    homepage,
    license,
    authors,
    platforms,
    source,
    source_files,
    requires_arc,
    swift_version,
  };
}

function getLicense({ license }: SpecificationData) {
  return typeof license === 'string' || license === undefined
    ? license
    : license.name;
}

function getAuthors({ authors }: SpecificationData) {
  if (typeof authors === 'string') {
    const [name, email] = authors.split(' => '); // can also be a ruby hash (should be fixed in the DB)
    return [{ name, email }];
  }
  return Object.entries(authors || {}).map(([name, email]) => ({
    name,
    email,
  }));
}

function truncate(text: string | undefined, length: number) {
  return text && text.length > length
    ? text.substr(0, length) + '*** TRUNCATED ***'
    : text;
}

function deHash<T>(hashed: string | T) {
  // TODO: transform { => } and ' => ' forms to an object
  if (typeof hashed === 'string') {
    return undefined;
  }
  return hashed;
}
