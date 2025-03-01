import { Client } from 'pg';

export class PostgresDriver {
  private client: Client | null = null;

  async connect(config: any): Promise<Client> {
    this.client = new Client(config);
    await this.client.connect();
    return this.client;
  }

  async query(query: string, bindings: any[]): Promise<any[]> {
    if (!this.client) throw new Error('Connection not established');
    const res = await this.client.query(query, bindings);
    return res.rows;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }
}