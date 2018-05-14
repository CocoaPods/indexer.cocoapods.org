import algoliasearch from 'algoliasearch';
import chunk from 'lodash/chunk';
import { Pod } from './types';
import log from './log';

export class Index {
  private _client: algoliasearch.Client;
  private _index: algoliasearch.Index;
  private indexName: string;

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
    this.indexName = indexName;
  }

  /**
   * Add a batch of Pods
   */
  async savePods(
    objects: Pod[],
    { batchSize = 1000 }: { batchSize?: number } = {}
  ) {
    const chunks = chunk(objects, batchSize);
    const operations = chunks.map(chunk => {
      log.info(`Indexing ${chunk.length} pods to ${this.indexName}`);
      this._index.saveObjects(chunk);
    });
    return Promise.all(operations);
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
    log.info('setting settings on', this.indexName);
    await this._index.setSettings(settings);
    await this._index.batchSynonyms(synonyms, {
      replaceExistingSynonyms: true,
    });
    return await this._index.batchRules(rules, {
      clearExistingRules: true,
    });
  }

  /**
   * Migrate this index to another index
   *
   * Note that this index will still exist, but the destination will be overwritten
   */
  async migrateTo(destinationIndex: Index) {
    const source = this.indexName;
    const destination = destinationIndex.indexName;

    log.info('moving', source, 'to', destination);
    // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/pull/25763
    return this._client.copyIndex(source, destination);
  }

  async waitTask({ taskID }: algoliasearch.Task) {
    return this._index.waitTask(taskID);
  }

  /**
   * clear and delete this index
   */
  async destroy() {
    log.info('removing the index', this.indexName);
    return this._client.deleteIndex(this.indexName);
  }
}
