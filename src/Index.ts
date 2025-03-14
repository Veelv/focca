import { ConnectionConfig } from './Connection';
import { Database } from './Database';

export { Migration } from './cli/Migration';
export { Entity } from './Entity/Entity';
export { BelongsToMany } from './Entity/BelongsToMany';
export { Blueprint } from './Shema/Blueprint';
export { ForeignKeyDefinition } from './Shema/ForeignKeyDefinition';
export { Schema } from './Shema/Schema';
export { Validator } from './Validator';
export { Seeder } from './Shema/Seeder';
export { QueryBuilder } from './QueryBuilder';
export { Connection } from './Connection';
export { Database } from './Database';
export { Uuid } from './utils/Uuid';
export { Str } from './utils/Str';
export { Hash, HashAlgorithm } from './utils/Hash';

async function initializeDatabase() {
  const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

  const config: ConnectionConfig = isNode ? {
    driver: 'mysql',
    host: 'localhost',
    username: 'root',
    password: 'password',
    database: 'test'
  } : {
    driver: 'mongodb',
    url: 'mongodb://localhost:27017/test',
    database: ''
  };

  await Database.addConnection('default', config);
  await Database.getConnection();
}

initializeDatabase().catch(console.error);