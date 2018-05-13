import algoliasearch from 'algoliasearch';
import { IndexablePod } from './types';

export class Index {
  private _client: algoliasearch.Client;
  private _index: algoliasearch.Index;

  constructor(indexName: string | undefined = process.env.ALGOLIA_INDEX_NAME) {
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
    if (!indexName) {
      throw new Error(
        'npm-search: Please provide the `ALGOLIA_INDEX_NAME` env variable and restart'
      );
    }

    this._client = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_API_KEY
    );

    this._index = this._client.initIndex(indexName);
  }

  /**
   * Add a batch of Pods
   */
  async savePods(objects: IndexablePod[]) {
    return this._index.saveObjects(objects);
  }

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
    await this._index.setSettings(settings);
    await this._index.batchSynonyms(synonyms, {
      replaceExistingSynonyms: true,
    });
    const { taskID } = await this._index.batchRules(rules, {
      clearExistingRules: true,
    });

    return this._index.waitTask(taskID);
  }

  /**
   * Migrate this index to another index
   *
   * Note that this index will still exist, but the destination will be overwritten
   */
  async migrateTo(destination: Index) {
    return this._client.copyIndex(
      // @ts-ignore (this should be added to the typings)
      this._index.indexName,
      // @ts-ignore (this should be added to the typings)
      destination._index.indexName,
      ['settings', 'synonyms', 'rules']
    );
  }

  /**
   * clear and delete this index
   */
  async destroy() {
    // @ts-ignore (this should be added to the typings)
    return this._client.deleteIndex(this._index.indexName);
  }
}
