import fs from "fs";
import path from "path";
import { Connection, ConnectionConfig } from "./Connection";

interface Config {
  default?: string;
  connections?: { [key: string]: ConnectionConfig };
}

export class Database {
  public static connections: { [key: string]: Connection } = {};
  public static defaultConnection: string | null = null;
  public static config: Config = {};

  static {
    const pathName = "focca.config.json";
    const projectRootConfig = path.resolve(__dirname, "../../", pathName);
    const cwdConfig = path.resolve(process.cwd(), pathName);

    const configFilePath = fs.existsSync(projectRootConfig)
      ? projectRootConfig
      : cwdConfig;

    if (fs.existsSync(configFilePath)) {
      const configFileContent = fs.readFileSync(configFilePath, "utf-8");
      this.config = JSON.parse(configFileContent);
    } else {
      console.warn(
        `Configuration file ${pathName} was not found, use the config:database command to generate the configuration file for the database.`
      );
      this.config = { default: "mysql", connections: {} };
    }

    this.defaultConnection = this.config.default || "mysql";

    if (this.config.connections) {
      Object.keys(this.config.connections).forEach((name) => {
        const connectionConfig = this.config.connections![name];
        this.addConnection(name, connectionConfig);
      });
    }
  }

  static addConnection(
    name: string,
    config: ConnectionConfig
  ): typeof Database {
    this.config.connections = this.config.connections || {};
    this.config.connections[name] = config;
    return this;
  }

  static async getConnection(name: string | null = null): Promise<Connection> {
    const connectionName = name || this.defaultConnection;

    if (!connectionName) {
      throw new Error("No default connection specified");
    }

    if (!this.config.connections || !this.config.connections[connectionName]) {
      throw new Error(`Connection "${connectionName}" is not configured`);
    }

    if (!this.connections[connectionName]) {
      const connectionConfig = this.config.connections[connectionName];
      this.connections[connectionName] = new Connection(connectionConfig);
      await this.connections[connectionName].connect();
    }

    return this.connections[connectionName];
  }

  static async closeConnections(): Promise<void> {
    for (const name in this.connections) {
      const connection = this.connections[name];
      await connection.close();
    }
    this.connections = {};
  }
}
