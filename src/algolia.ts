import algoliasearch from 'algoliasearch';
import { IndexablePod } from './types';

export const createIndex = (
  indexName: string = process.env.ALGOLIA_INDEX_NAME
) => {
  if (!process.env.ALGOLIA_APP_ID) {
    throw new Error(
      'npm-search: Please provide the `ALGOLIA_APP_ID` env variable and restart'
    );
  }
  if (!process.env.ALGOLIA_API_KEY) {
    throw new Error(
      'npm-search: Please provide the `ALGOLIA_API_KEY` env variable and restart'
    );
  }

  const client = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_API_KEY
  );
  const index = client.initIndex(indexName);

  return {
    _client: client,
    _index: index,

    /**
     * Add a batch of Pods
     */
    async savePods(objects: IndexablePod[]) {
      return index.saveObjects(objects);
    },

    /**
     * Set all settings.
     *
     * Note that this will overwrite existing settings, synonyms and query rules.
     */
    async setAllSettings({
      settings = {},
      synonyms = [],
      rules = [],
    }: {
      settings: algoliasearch.IndexSettings;
      synonyms: algoliasearch.Synonym[];
      rules: algoliasearch.Rule[];
    }) {
      await index.setSettings(settings);
      await index.batchSynonyms(synonyms, {
        replaceExistingSynonyms: true,
      });
      const { taskID } = await index.batchRules(rules, {
        clearExistingRules: true,
      });

      return index.waitTask(taskID);
    },
  };
};
