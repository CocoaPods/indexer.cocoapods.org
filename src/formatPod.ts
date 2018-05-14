import { SpecificationData, Pod } from './types';
import log from './log';
import { Row } from './index';

export function formatPod({ objectID, specification_data }: Row): Pod {
  const specificationData: SpecificationData = JSON.parse(specification_data);

  log.debug('Now transforming', objectID, { specificationData });

  const authors = getAuthors(specificationData);
  const license = getLicense(specificationData);
  const summary = truncate(specificationData.summary, 500);
  const {
    name,
    version,
    homepage,
    platforms,
    source,
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

function getLicense(specificationData: SpecificationData) {
  return typeof specificationData.license === 'string' ||
    specificationData.license === undefined
    ? specificationData.license
    : specificationData.license.name;
}

function getAuthors(specificationData: SpecificationData) {
  return Object.entries(specificationData.authors || {}).map(
    ([name, email]) => ({
      name,
      email,
    })
  );
}

function truncate(text: string | undefined, length: number) {
  return text && text.length > length
    ? text.substr(0, length) + '*** TRUNCATED ***'
    : text;
}
