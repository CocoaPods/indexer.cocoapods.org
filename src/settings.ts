import { IndexSettings, Synonym, Rule } from 'algoliasearch';

export const settings: IndexSettings = {
  searchableAttributes: ['name', 'summary', 'authors.name'],
  attributesForFaceting: ['platforms', 'license.type', 'requires_arc'],
  // @ts-ignore
  camelCaseAttributes: ['name'],
};

export const synonyms: Synonym[] = [];

export const rules: Rule[] = [];
