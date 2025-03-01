import { Database as SqliteDatabase } from 'sqlite3';

export class SqliteDriver {
  private db: SqliteDatabase | null = null;

  async connect(config: any): Promise<SqliteDatabase> {
    this.db = new SqliteDatabase(config.database);
    return this.db;
  }

  async query(query: string, bindings: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Connection not established'));
      this.db.all(query, bindings, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}