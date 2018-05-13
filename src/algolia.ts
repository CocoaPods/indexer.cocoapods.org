import algoliasearch from 'algoliasearch';

export const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
export const index = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_NAME);