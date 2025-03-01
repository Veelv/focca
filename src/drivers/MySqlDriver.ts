import { createConnection, Connection } from 'mysql2/promise';

export class MySqlDriver {
  private connection: Connection | null = null;

  async connect(config: any): Promise<Connection> {
    console.log('Connecting with config:', config);
    this.connection = await createConnection({
      host: config.host || 'localhost',
      port: config.port || 3306,
      user: config.username,
      password: config.password,
      database: config.database,
    });
    return this.connection;
  }

  async query(query: string, bindings: any[] = []): Promise<any[]> {
    if (!this.connection) throw new Error('Connection not established');
    const [rows]: [any[], any] = await this.connection.query(query, bindings);
    return rows;
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
  
  // Adicione este método que falta
  getConnection(): Connection | null {
    return this.connection;
  }
}