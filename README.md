# indexer.cocoapods.org

A service that handles indexing Pods into Algolia for search.

## Status

In production use at [cocoapods.org](https://cocoapods.org).

Note that webhooks aren't implemented yet, and only daily a reindex is done.

## Role

This service will periodically read the whole CocoaPods database, and index them completely into Algolia. Then after that's done, it will also listen for webhooks for extra metadata; as well as updates and deletions in Pods.

## Contributing

You will need Node and Yarn installed.

```sh
# Node
brew install node # simple
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash # node version manager

# Yarn
brew install yarn
```

Then clone the repo, install deps, and run tests:

```sh
git clone https://github.com/CocoaPods/indexer.cocoapods.org.git
cd indexer.cocoapods.org
yarn install
yarn jest
```

Once you see the test passed you can run the server locally:

```sh
yarn dev
```

Or alternatively:

```sh
yarn build && yarn start
```

You'll see some errors telling you to set certain environment variables. For development you can use a personal [Algolia](https://www.algolia.com/) account. Set the following variables:

```
export ALGOLIA_APP_ID=<your-app-id>
export ALGOLIA_API_KEY=<your-api-key>
export ALGOLIA_INDEX_NAME=<your-index-name>
```

I'd recommend using VS Code for editing, this project includes extension recommendations.
