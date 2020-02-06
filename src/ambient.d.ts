declare module '*.sql' {
  const query: string;
  export default query;
}

declare module 'pg-cursor' {
  export default class Cursor<Row> {
    constructor(text: string, values?: any[], config?: object) {}
    read(rows: number, cb: (err: Error | undefined, rows: Row[]) => void) {}
  }
}
