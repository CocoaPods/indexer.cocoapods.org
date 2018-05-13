export interface Pod {
  name: string;
  version: string; // semver
  summary: string;
  homepage: string; // url
  license: string; // validates
  authors: {
    [key: string]: string; // email
  };
  platforms: { [key in Partial<'ios' | 'mac' | 'tv'>]: string };
  source: {
    git: string; // git url
    tag: string; // semver
  };
  source_files: string; // path
  requires_arc: boolean;
  swift_version: string; // version
}

export type AlgoliaRecord = { objectID: string };

export type IndexablePod = Pod & AlgoliaRecord;
