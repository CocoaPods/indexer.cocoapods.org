import { ParsedRow } from '../database';
import log from '../log';
import { Pod, SpecificationData } from '../types';
import { getLicense } from './getLicense';
import { getAuthors } from './getAuthors';
import { getAlternativeNames } from './getAlternativeNames';
import isEmpty from 'lodash/isEmpty';

export function formatPod({
  objectID,
  specificationData,
  downloads,
}: ParsedRow): Pod {
  if (isEmpty(specificationData)) {
    log.debug(
      `Skipping specification data processing for ${objectID}, since it is`,
      specificationData
    );

    return {
      objectID,
      name: objectID,
      version: '0.0.0',
      downloads,
      summary: 'Unparsable at `trunk` import time.',
      _searchInternal: {
        alternativeNames: [objectID],
        downloadsMagnitude: getDownloadsMagnitude(downloads),
      },
    };
  }

  const spec = specificationData as SpecificationData;

  if (spec.deprecated === true) {
    return {
      objectID,
      name: objectID,
      version: '0.0.0',
      downloads,
      summary: 'This pod is deprecated',
      _searchInternal: {
        alternativeNames: [objectID],
        downloadsMagnitude: getDownloadsMagnitude(downloads),
      },
    };
  }

  log.debug('Now transforming', objectID, { spec });

  const authors = getAuthors(spec);
  const license = getLicense(spec);
  const summary = truncate(spec.summary, 500);
  const source = deHash<{ git: string; tag: string }>(spec.source);
  const dependencies = getDependencies(spec);
  const repoOwner = getRepoOwner(spec);
  const downloadsMagnitude = getDownloadsMagnitude(downloads);
  const alternativeNames = getAlternativeNames(spec, objectID);
  const { name, version, homepage, platforms, swift_version } = spec;

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
    swift_version,
    dependencies,
    downloads,
    repoOwner,
    _searchInternal: {
      alternativeNames,
      downloadsMagnitude,
    },
  };
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

const magnitude = (num: number | null) => (num || 0).toString().length;

function getDownloadsMagnitude(downloads: {
  lastMonth: number;
  total: number;
  appsTouched: number;
}) {
  return {
    lastMonth: magnitude(downloads.lastMonth),
    total: magnitude(downloads.total),
    appsTouched: magnitude(downloads.appsTouched),
  };
}

function getDependencies({ dependencies = {} }: SpecificationData) {
  return Object.keys(dependencies);
}

function getRepoOwner({ source }: SpecificationData) {
  if (typeof source === 'object' && source.git) {
    const { user } = getRepositoryInfoFromHttpUrl(source.git);
    return user;
  }
}

/**
 * Get info from urls like this: (has multiple packages in one repo, like babel does)
 *  https://github.com/babel/babel/tree/master/packages/babel
 *  https://gitlab.com/user/repo/tree/master/packages/project1
 *  https://bitbucket.org/user/repo/src/ae8df4cd0e809a789e3f96fd114075191c0d5c8b/packages/project1/
 *
 * This function is like getGitHubRepoInfo (above), but support github, gitlab and bitbucket.
 */
function getRepositoryInfoFromHttpUrl(repository: string) {
  const result = repository.match(
    /^https?:\/\/(?:www\.)?((?:github|gitlab|bitbucket)).((?:com|org))\/([^/]+)\/([^/]+)(\/.+)?$/
  );

  if (!result || result.length < 6) {
    return {};
  }

  const [, domain, domainTld, user, project, path = ''] = result;

  return {
    host: `${domain}.${domainTld}`,
    user,
    project,
    path,
  };
}
