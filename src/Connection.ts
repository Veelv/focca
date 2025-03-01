import { MySqlDriver } from "./drivers/MySqlDriver";
import { MongoDriver } from "./drivers/MongoDriver";
import { SqliteDriver } from "./drivers/SqliteDriver";
import { PostgresDriver } from "./drivers/PostgresDriver";
import { SqlServerDriver } from "./drivers/SqlServerDriver";

export interface ConnectionConfig {
  driver: "mysql" | "mongodb" | "sqlite" | "postgres" | "sqlserver";
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
  url?: string;
}

export class Connection {
  private driver: any;
  private config: ConnectionConfig;

  constructor(config: ConnectionConfig) {
    this.config = config;
    this.driver = this.createDriver(config.driver);
  }

  private createDriver(driverType: string) {
    switch (driverType) {
      case "mysql":
        return new MySqlDriver();
      case "mongodb":
        return new MongoDriver();
      case "sqlite":
        return new SqliteDriver();
      case "postgres":
        return new PostgresDriver();
      case "sqlserver":
        return new SqlServerDriver();
      default:
        throw new Error(`Driver ${driverType} not supported`);
    }
  }

  async connect(): Promise<any> {
    return this.driver.connect(this.config);
  }

  async query(query: string, bindings: any[] = []): Promise<any[]> {
    return this.driver.query(query, bindings);
  }

  async close(): Promise<void> {
    return this.driver.close();
  }

  public getConnection(): any {
    return this.driver;
  }
  
  public getDriver(): any {
    return this.driver;
  }
}