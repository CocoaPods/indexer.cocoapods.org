import { IndexSettings, Synonym, Rule } from 'algoliasearch';

export const settings: IndexSettings = {
  searchableAttributes: [
    'name',
    '_searchInternal.alternativeNames',
    'summary',
    'authors.name',
    'repoOwner',
  ],
  ranking: [
    'typo',
    'words',
    'filters',
    'proximity',
    'attribute',
    'exact',
    'custom',
  ],
  customRanking: [
    'desc(_searchInternal.downloadsMagnitude.lastMonth)',
    'desc(_searchInternal.downloadsMagnitude.appsTouched)',
    'desc(_searchInternal.downloadsMagnitude.total)',
    'desc(downloads.lastMonth)',
    'desc(downloads.appsTouched)',
    'desc(downloads.total)',
  ],
  attributesForFaceting: [
    'platforms',
    'license.type',
    'searchable(authors.name)',
  ],
  attributeForDistinct: 'name',
  camelCaseAttributes: ['name'],
  unretrievableAttributes: ['_searchInternal'],
  separatorsToIndex: '-_',
};

export const synonyms: Synonym[] = [];

export const rules: Rule[] = [];
