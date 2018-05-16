import { IndexSettings, Synonym, Rule } from 'algoliasearch';

export const settings: IndexSettings = {
  searchableAttributes: ['name', 'summary', 'authors.name', 'repoOwner'],
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
    'desc(downloads.magnitude.lastMonth)',
    'desc(downloads.magnitude.appsTouched)',
    'desc(downloads.magnitude.total)',
    'desc(downloads.lastMonth)',
    'desc(downloads.appsTouched)',
    'desc(downloads.total)',
  ],
  attributesForFaceting: [
    'platforms',
    'license.type',
    'requires_arc',
    'searchable(authors.name)',
  ],
  attributeForDistinct: 'name',
  distinct: true,
  // @ts-ignore
  camelCaseAttributes: ['name'],
  unretrievableAttributes: ['downloads.magnitude'],
};

export const synonyms: Synonym[] = [];

export const rules: Rule[] = [];
