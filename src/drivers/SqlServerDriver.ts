import { ConnectionPool } from 'mssql';

export class SqlServerDriver {
  private pool: ConnectionPool | null = null;

  async connect(config: any): Promise<ConnectionPool> {
    this.pool = new ConnectionPool(config);
    await this.pool.connect();
    return this.pool;
  }

  async query(query: string, bindings: any[]): Promise<any[]> {
    if (!this.pool) throw new Error('Connection not established');
    const result = await this.pool.request().query(query);
    return result.recordset;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}