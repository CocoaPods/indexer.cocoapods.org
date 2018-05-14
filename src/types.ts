export interface SpecificationData {
  name: string;
  /**
   * current version as a string (SemVer)
   */
  version: string;
  summary: string;
  /**
   * Home page of the project (url)
   */
  homepage: string;
  /**
   * Any OSI-compliant license
   */
  license: string;
  authors?: {
    [name: string]: string;
  };
  /**
   * supported version of each platform
   */
  platforms: { [key in Partial<'ios' | 'mac' | 'tv'>]: string };
  source: {
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
   * A path the the source files
   */
  source_files: string;
  requires_arc: boolean;
  /**
   * minimal supported swift version as a string
   */
  swift_version: string;
}

export interface Pod {
  objectID: string;
  name: string;
  /**
   * current version as a string (SemVer)
   */
  version: string;
  summary: string;
  /**
   * Home page of the project (url)
   */
  homepage: string;
  /**
   * Any OSI-compliant license
   */
  license: string;
  authors?: {
    name: string;
    email: string;
  }[];
  /**
   * supported version of each platform
   */
  platforms: { [key in Partial<'ios' | 'mac' | 'tv'>]: string };
  source: {
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
   * A path the the source files
   */
  source_files: string;
  requires_arc: boolean;
  /**
   * minimal supported swift version as a string
   */
  swift_version: string;
}
