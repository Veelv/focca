import { MongoClient } from 'mongodb';

export class MongoDriver {
  private client: MongoClient | null = null;

  async connect(config: any): Promise<any> {
    this.client = new MongoClient(config.url);
    await this.client.connect();
    return this.client.db(config.database);
  }

  async query(collection: string, query: any): Promise<any[]> {
    if (!this.client) throw new Error('Connection not established');
    return this.client.db().collection(collection).find(query).toArray();
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}