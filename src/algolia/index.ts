import algoliasearch from 'algoliasearch';
import chunk from 'lodash/chunk';
import { Pod } from '../types';
import log from '../log';
import { StateManager } from './StateManager';

export class Index<UserData extends object> {
  private _client: algoliasearch.Client;
  private _index: algoliasearch.Index;
  indexName: string;
  state?: StateManager<UserData>;

  constructor({
    indexName = process.env.ALGOLIA_INDEX_NAME,
    defaultState,
  }: {
    indexName: string | undefined;
    defaultState?: UserData;
  }) {
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
    if (defaultState) {
      this.state = new StateManager<UserData>({
        defaultState,

        getUserData: async (): Promise<UserData | undefined> =>
          this._index
            .getSettings()
            // @ts-ignore we can't document this in the typings since it's internal!
            .then(({ userData }: { userData: UserData }) => userData),

        setUserData: async (userData: UserData): Promise<algoliasearch.Task> =>
          this._index.setSettings({
            // @ts-ignore we can't document this in the typings since it's internal!
            userData,
          }),
      });
    }
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
      return this._index.saveObjects(chunk);
    });
    const tasks = await Promise.all(operations);
    return tasks[tasks.length - 1];
  }

  async savePod(object: Pod) {
    log.info(`Indexing ${object.objectID} pods to ${this.indexName}`);
    return this._index.saveObject(object);
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
    log.info('Setting settings on', this.indexName);
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
  async migrateTo(destinationIndex: Index<UserData>) {
    const source = this.indexName;
    const destination = destinationIndex.indexName;

    log.info('Moving', source, 'to', destination);
    return this._client.copyIndex(source, destination);
  }

  async waitTask({ taskID }: Pick<algoliasearch.Task, 'taskID'>) {
    log.info(`Waiting for Algolia task ${taskID} on ${this.indexName}`);
    return this._index.waitTask(taskID);
  }

  /**
   * clear and delete this index
   */
  async destroy() {
    log.info('Removing the index', this.indexName);
    return this._client.deleteIndex(this.indexName);
  }
}
