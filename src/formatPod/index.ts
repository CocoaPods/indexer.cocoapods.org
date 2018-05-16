import { ParsedRow } from '../database';
import log from '../log';
import { Pod, SpecificationData } from '../types';
import { getLicense } from './getLicense';
import { getAuthors } from './getAuthors';

export function formatPod({
  objectID,
  specificationData,
  downloads: rawDownloads,
}: ParsedRow): Pod {
  const spec = specificationData || {};

  log.debug('Now transforming', objectID, { spec });

  const authors = getAuthors(spec);
  const license = getLicense(spec);
  const summary = truncate(spec.summary, 500);
  const source = deHash<{ git: string; tag: string }>(spec.source);
  const downloads = getDownloads(rawDownloads);
  const dependencies = getDependencies(spec);
  const repoOwner = getRepoOwner(spec);
  const {
    name,
    version,
    homepage,
    platforms,
    requires_arc,
    swift_version,
  } = spec;

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
    requires_arc,
    swift_version,
    dependencies,
    downloads,
    repoOwner,
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

const magnitude = (num: number) => num.toString().length;

function getDownloads(downloads: {
  lastMonth: number;
  total: number;
  appsTouched: number;
}) {
  return {
    ...downloads,
    magnitude: {
      lastMonth: magnitude(downloads.lastMonth),
      total: magnitude(downloads.total),
      appsTouched: magnitude(downloads.appsTouched),
    },
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
