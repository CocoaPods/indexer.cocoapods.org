type RawAuthor =
  | {
      [name: string]: string;
    }
  | string;
// { name: string, email ?: string }

type RawAuthors = RawAuthor | RawAuthor[];

export interface SpecificationData {
  name: string;
  /**
   * current version as a string (SemVer)
   */
  version: string;
  summary?: string;
  /**
   * Home page of the project (url)
   */
  homepage?: string;
  /**
   * Any OSI-compliant license
   */
  license?:
    | {
        name: string;
        text: string;
      }
    | string; // can be just the type or a ruby hash too
  authors?: RawAuthors;
  /**
   * supported version of each platform
   */
  platforms?: { [key in Partial<'ios' | 'mac' | 'tv'>]: string };
  source:
    | {
        /**
         * url
         */
        git: string;
        /**
         * (git) tag of this version
         */
        tag: string;
      }
    | string; // can also be a ruby hash
  /**
   * A path the the source files
   */
  source_files: string;
  requires_arc: any;
  /**
   * minimal supported swift version as a string
   */
  swift_version: string;
  dependencies?: {
    [name: string]: string;
  };
  deprecated: boolean;
}

export interface Pod {
  objectID: string;
  name: string;
  /**
   * current version as a string (SemVer)
   */
  version: string;
  summary?: string;
  /**
   * Home page of the project (url)
   */
  homepage?: string;
  /**
   * Any OSI-compliant license
   */
  license?: string;
  authors?: {
    name: string;
    email: string;
    avatar?: string;
  }[];
  repoOwner?: string;
  /**
   * supported version of each platform
   */
  platforms?: { [key in Partial<'ios' | 'mac' | 'tv'>]: string };
  source?: {
    /**
     * url
     */
    git: string;
    /**
     * (git) tag of this version
     */
    tag: string;
  };
  /**
   * minimal supported swift version as a string
   */
  swift_version?: string;
  dependencies?: string[];
  downloads: {
    lastMonth: number;
    total: number;
    appsTouched: number;
  };
  _searchInternal: {
    alternativeNames: string[];
    downloadsMagnitude: {
      lastMonth: number;
      total: number;
      appsTouched: number;
    };
  };
}
