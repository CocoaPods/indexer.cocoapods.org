module.exports = [
  {
    objectID: 'pbflatui',
    specificationData: {
      name: 'PBFlatUI',
      version: '1.0.0',
      requires_arc: true,
      authors: { 'Piotr Bernad': 'piotrbernadd@gmail.com' },
      platforms: { ios: '6.0' },
      summary: 'Easy-to-use UI for iOS apps.',
      license: { type: 'MIT' },
      // TODO: copy a new version of this which has the full json
      ios: {
        xcconfig: {
          HEADER_SEARCH_PATHS: '$(PODS_ROOT)/../../PBFlatUI/**',
        },
      },
      homepage: 'http://github.com/piotrbernad/FlatUI',
      source: {
        git: 'https://github.com/piotrbernad/FlatUI.git',
        tag: '1.0.0',
      },
      source_files: 'FlatUI/Classess/*.{h,m}',
    },
    downloads: { lastMonth: 241, total: 13149, appsTouched: 69 },
  },
  {
    objectID: 'klscrollselect',
    specificationData: {
      name: 'KLScrollSelect',
      platforms: { ios: '5.0' },
      version: '0.0.1',
      summary:
        'A control that infinitely scrolls up and down at variable speeds inspired by Expedia 3.0 app.',
      homepage: 'https://github.com/KieranLafferty/KLScrollSelect',
      license: 'Apache License, Version 2.0',
      authors: { 'Kieran Lafferty': 'kieran.lafferty@gmail.com' },
      source: {
        git: 'https://github.com/KieranLafferty/KLScrollSelect.git',
        commit: '234be17688dcb02699de1726aca867db82ba7272',
      },
      source_files: 'KLScrollSelect/KLScrollSelect/*.{h,m}',
      requires_arc: true,
      frameworks: 'QuartzCore',
    },
    downloads: { lastMonth: 0, total: 154, appsTouched: 11 },
  },
  {
    objectID: 'socketclient',
    specificationData: {
      name: 'SocketClient',
      version: '0.1.1',
      summary:
        'Simple, fast & reliable Faye Websocket client. Well documented API build on SocketRocket. Supports messaging ondifferent channels.',
      homepage: 'https://github.com/redpeppix-gmbh-co-kg/SocketClient',
      authors: { 'Marius Rackwitz': 'marius@paij.com' },
      license: 'MIT License',
      source: {
        git: 'https://github.com/redpeppix-gmbh-co-kg/SocketClient.git',
        tag: '0.1.1',
      },
      source_files: 'SocketClient/*.{h,m,c}',
      platforms: { ios: '5.0' },
      requires_arc: true,
      ios: { frameworks: [] },
      libraries: 'icucore',
      dependencies: { SocketRocket: [] },
    },
    downloads: { lastMonth: 2, total: 80, appsTouched: 5 },
  },
  {
    objectID: 'adtickerlabel',
    specificationData: {
      name: 'ADTickerLabel',
      version: '0.57',
      summary:
        'ADTickerLabel An objective-c UIView which provide a mechanism to show numbers with rolling effect, like in counter.',
      description:
        '                    ADTickerLabel An objective-c UIView which provide a mechanism to show numbers with rolling effect, like in counter.\n',
      homepage: 'https://github.com/Antondomashnev',
      authors: { 'Anton Domashnev': 'antondomashnev@gmail.com' },
      source: {
        git: 'https://github.com/Antondomashnev/ADTickerLabel.git',
        tag: '0.57',
      },
      platforms: { ios: null },
      source_files: '*.{h,m}',
      license: { type: 'MIT', file: 'LICENSE' },
      frameworks: ['CoreGraphics', 'QuartzCore'],
      requires_arc: true,
    },
    downloads: { lastMonth: 2064, total: 62002, appsTouched: 120 },
  },
  {
    objectID: 'yajl-objc',
    specificationData: {
      name: 'yajl-objc',
      version: '0.2.27',
      summary:
        'Objective-C bindings for YAJL (Yet Another JSON Library) C library.',
      homepage: 'http://lloyd.github.com/yajl',
      license: 'MIT',
      authors: { 'Gabriel Handford': 'gabrielh@gmail.com' },
      source: { git: 'https://github.com/a2/yajl-objc.git', tag: 'v0.2.27' },
      source_files: ['Classes/*.{h,m}', 'Libraries/{GHKit,GTM}/*.{h,m}'],
      dependencies: { yajl: [] },
      requires_arc: false,
    },
    downloads: { lastMonth: 4413, total: 163919, appsTouched: 275 },
  },
];
