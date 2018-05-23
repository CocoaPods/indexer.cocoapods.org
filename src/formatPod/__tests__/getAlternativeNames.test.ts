import { getAlternativeNames } from '../getAlternativeNames';
import { SpecificationData } from '../../types';

it('leaves normal names as-is', () => {
  const spec = { name: 'StupidName' } as SpecificationData;
  const objectID = 'stupidname';
  expect(getAlternativeNames(spec, objectID)).toEqual([
    'StupidName',
    'stupidname',
  ]);
});

it('Deals with dashes', () => {
  const spec = { name: 'AlgoliaSearch-Client-Swift' } as SpecificationData;
  const objectID = 'algoliasearch-client-swift';
  expect(getAlternativeNames(spec, objectID)).toEqual([
    'AlgoliaSearchClientSwift',
    'AlgoliaSearch Client Swift',
    'algoliasearch-client-swift',
  ]);
});
