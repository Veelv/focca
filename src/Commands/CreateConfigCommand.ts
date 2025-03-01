import fs from 'fs';
import path from 'path';

interface DatabaseConfig {
  driver: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  url?: string;
}

interface Config {
  default: string;
  connections: Record<string, DatabaseConfig>;
}

export class CreateConfigCommand {
    async execute(databaseTypes: string[], options: { update?: boolean, remove?: boolean } = {}): Promise<void> {
      if (databaseTypes.length === 0) {
        console.error("Nenhum tipo de banco de dados fornecido.");
        return;
      }
      
      const configFilePath = path.join(__dirname, '../../', 'focca.config.json');
      
      let config: Config = {
        default: databaseTypes[0],
        connections: {}
      };
      
      if (fs.existsSync(configFilePath)) {
        try {
          const existingConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
          config = existingConfig;
          
          if (!options.remove && !options.update) {
            console.log("A configuração já foi criada. Para atualizar, use o comando 'config:refresh'.");
            return;
          }
        } catch (error) {
          console.error("Erro ao ler configuração existente:", error);
          return;
        }
      }
      
      if (options.remove) {
        databaseTypes.forEach(dbType => {
          const normalizedType = this.normalizeDbType(dbType);
          if (config.connections[normalizedType]) {
            delete config.connections[normalizedType];
            console.log(`Banco de dados '${normalizedType}' removido da configuração.`);
          } else {
            console.log(`Banco de dados '${normalizedType}' não encontrado na configuração.`);
          }
        });
        
        if (databaseTypes.includes(config.default) || 
            databaseTypes.some(db => this.normalizeDbType(db) === config.default)) {
          const availableDbs = Object.keys(config.connections);
          if (availableDbs.length > 0) {
            config.default = availableDbs[0];
            console.log(`Banco de dados padrão atualizado para '${config.default}'.`);
          } else {
            console.warn("Aviso: Não há mais bancos de dados na configuração!");
          }
        }
      } else {
        databaseTypes.forEach((dbType: string) => {
          const normalizedType = this.normalizeDbType(dbType);
          
          switch (normalizedType) {
            case 'mysql':
              config.connections.mysql = {
                driver: "mysql",
                host: "localhost",
                port: 3306,
                username: "your_username",
                password: "your_password",
                database: "your_database"
              };
              break;
            case 'mongodb':
              config.connections.mongodb = {
                driver: "mongodb",
                url: "mongodb://localhost:27017/your_database"
              };
              break;
            case 'sqlite':
              config.connections.sqlite = {
                driver: "sqlite",
                database: "path/to/your/database.sqlite"
              };
              break;
            case 'postgres':
              config.connections.postgres = {
                driver: "postgres",
                host: "localhost",
                port: 5432,
                username: "your_username",
                password: "your_password",
                database: "your_database"
              };
              break;
            case 'sqlserver':
              config.connections.sqlserver = {
                driver: "sqlserver",
                host: "localhost",
                port: 1433,
                username: "your_username",
                password: "your_password",
                database: "your_database"
              };
              break;
            default:
              console.error(`Tipo de banco de dados não suportado: ${dbType}`);
          }
        });
        
        if (!options.update && databaseTypes.length > 0) {
          config.default = this.normalizeDbType(databaseTypes[0]);
        }
      }
      
      fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
      
      if (options.remove) {
        console.log(`Configuração atualizada em: ${configFilePath}`);
      } else if (options.update) {
        console.log(`Configuração atualizada em: ${configFilePath}`);
      } else {
        console.log(`Configuração criada em: ${configFilePath}`);
      }
    }
    
    private normalizeDbType(dbType: string): string {
      const typeMap: Record<string, string> = {
        'mongo': 'mongodb',
        'postgresql': 'postgres',
        'pg': 'postgres',
        'mssql': 'sqlserver',
        'sql-server': 'sqlserver'
      };
      
      return typeMap[dbType.toLowerCase()] || dbType.toLowerCase();
    }
}