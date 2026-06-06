declare module "better-sqlite3" {
  class Database {
    constructor(filename: string);
    pragma(value: string): unknown;
    exec(sql: string): unknown;
  }

  export = Database;
}
