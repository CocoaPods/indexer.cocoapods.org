// mock of algoliasearch, doesn't actually index to Algolia
const log = require('../src/log');
const EventEmitter = require('events');

const indexes = {};

class NotFound extends Error {
  constructor(msg) {
    super(msg || 'Not found');
    this.statusCode = 404;
  }
}

class BrowseEmitter extends EventEmitter {}

function initIndex(indexName, props) {
  if (!indexes[indexName]) {
    const _props = {
      exists: Boolean(props),
      records: {},
      rules: {},
      ...props,
    };
    log.debug(`created index ${indexName} with props`, _props);
    indexes[indexName] = {
      _props,
      // settings
      getSettings: () =>
        new Promise((resolve, reject) => {
          // (exists ? resolve({}) : reject(new NotFound()))
          if (_props.exists) resolve({});
          else reject(new NotFound());
        }),
      setSettings: () => {
        _props.exists = true;
        return Promise.resolve({});
      },
      // query rules
      getRule: objectID => Promise.resolve(_props.rules[objectID]),
      saveRule: rule => {
        _props.exists = true;
        _props.rules[rule.objectID] = rule;
        return Promise.resolve({});
      },
      clearRules: () => {
        _props.rules.splice(0, _props.rules.length);
        return Promise.resolve({});
      },
      // records
      addObject: record => {
        _props.exists = true;
        _props.records[record.objectID] = record;
        return Promise.resolve({});
      },
      addObjects: records => {
        _props.exists = true;
        records.forEach(record => (_props.records[record.objectID] = record));
        return Promise.resolve({});
      },
      deleteObject: objectID => {
        delete _props.records[objectID];
        return Promise.resolve({});
      },
      browseAll: () => {
        const emitter = new BrowseEmitter();
        const toSend = Object.values(_props.records);
        const sendNext = () => {
          if (toSend.length) {
            emitter.emit('result', { hits: [toSend.shift()] });
            setTimeout(sendNext, 10);
          } else {
            emitter.emit('end');
          }
        };
        setTimeout(sendNext, 10);
        return emitter;
      },
      search: jest.fn(() =>
        Promise.resolve({ nbHits: Object.keys(_props.records).length })
      ),
      // other methods
      waitTask: jest.fn(() => Promise.resolve({})),
      // methods that are not yet implemented
      /*
      addApiKey: jest.fn(() => Promise.resolve({})),
      batch: jest.fn(() => Promise.resolve({})),
      batchRules: jest.fn(() => Promise.resolve({})),
      batchSynonyms: jest.fn(() => Promise.resolve({})),
      browse: jest.fn(() => Promise.resolve({})),
      browseFrom: jest.fn(() => Promise.resolve({})),
      clearSynonyms: jest.fn(() => Promise.resolve({})),
      deleteApiKey: jest.fn(() => Promise.resolve({})),
      deleteBy: jest.fn(() => Promise.resolve({})),
      deleteObjects: jest.fn(() => Promise.resolve({})),
      deleteRule: jest.fn(() => Promise.resolve({})),
      deleteSynonym: jest.fn(() => Promise.resolve({})),
      getApiKey: jest.fn(() => Promise.resolve({})),
      getObject: jest.fn(() => Promise.resolve({})),
      getObjects: jest.fn(() => Promise.resolve({})),
      getSynonym: jest.fn(() => Promise.resolve({})),
      index: jest.fn(() => Promise.resolve({})),
      listApiKeys: jest.fn(() => Promise.resolve({})),
      partialUpdateObject: jest.fn(() => Promise.resolve({})),
      partialUpdateObjects: jest.fn(() => Promise.resolve({})),
      saveObject: jest.fn(() => Promise.resolve({})),
      saveObjects: jest.fn(() => Promise.resolve({})),
      saveSynonym: jest.fn(() => Promise.resolve({})),
      searchForFacetValues: jest.fn(() => Promise.resolve({})),
      searchRules: jest.fn(() => Promise.resolve({})),
      searchSynonyms: jest.fn(() => Promise.resolve({})),
      updateApiKey: jest.fn(() => Promise.resolve({})),
      */
    };
  }
  return indexes[indexName];
}

const algoliasearch = (/* appId, apiKey*/) => ({
  // implemented mocks
  initIndex,
  listIndexes: () =>
    Promise.resolve({
      items: Object.keys(indexes).map(indexName => ({ name: indexName })),
    }),
  deleteIndex: objectID => {
    delete indexes[objectID];
    return Promise.resolve({});
  },
  copyIndex: (sourceIdxName, destIdxName, scopes) => {
    log.debug(
      `copyIndex ${sourceIdxName} -> ${destIdxName} with scopes`,
      scopes
    );
    const props = !scopes
      ? { ...indexes[sourceIdxName]._props }
      : scopes.reduce(
          // copy only the properties listed in scopes
          (propsObj, scope) => ({
            ...propsObj,
            [scope]: { ...indexes[sourceIdxName]._props[scope] },
          }),
          {}
        );
    if (indexes[destIdxName]) {
      indexes[destIdxName]._props = { ...indexes[destIdxName]._props, props };
    } else {
      indexes[destIdxName] = initIndex(destIdxName, props);
    }
    indexes[destIdxName]._props.exists = true;
    return Promise.resolve({});
  },
  moveIndex: (sourceIdxName, destIdxName) => {
    log.debug(`moveIndex ${sourceIdxName} -> ${destIdxName}`);
    if (indexes[destIdxName]) {
      indexes[destIdxName]._props.records = {
        ...indexes[sourceIdxName]._props.records,
      };
    } else {
      indexes[destIdxName] = initIndex(destIdxName, {
        ...indexes[sourceIdxName]._props,
      });
    }
    indexes[destIdxName]._props.exists = true;
    delete indexes[sourceIdxName];
    return Promise.resolve({});
  },
  // other methods used
  addAlgoliaAgent: jest.fn(() => Promise.resolve({})),
  // methods that are not yet used
  /*
  clearIndex: jest.fn(() => Promise.resolve({})),
  addApiKey: jest.fn(() => Promise.resolve({})),
  assignUserID: jest.fn(() => Promise.resolve({})),
  batch: jest.fn(() => Promise.resolve({})),
  deleteApiKey: jest.fn(() => Promise.resolve({})),
  getApiKey: jest.fn(() => Promise.resolve({})),
  getLogs: jest.fn(() => Promise.resolve({})),
  getTopUserID: jest.fn(() => Promise.resolve({})),
  getUserID: jest.fn(() => Promise.resolve({})),
  index: jest.fn(() => Promise.resolve({})),
  listApiKeys: jest.fn(() => Promise.resolve({})),
  listClusters: jest.fn(() => Promise.resolve({})),
  listUserIDs: jest.fn(() => Promise.resolve({})),
  removeUserID: jest.fn(() => Promise.resolve({})),
  search: jest.fn(() => Promise.resolve({})),
  searchUserIDs: jest.fn(() => Promise.resolve({})),
  updateApiKey: jest.fn(() => Promise.resolve({})),
  */
});

module.exports = algoliasearch;
