import { Database } from '../../src/Database';

describe('Database Configuration', () => {
  it('should load the configuration from the config file', () => {
    expect(Database.config).toHaveProperty('default');
    expect(Database.config.connections).toBeDefined();
  });

  it('should establish a connection to the default database', async () => {
    const connection = await Database.getConnection();
    expect(connection).toBeDefined();
  });
  
  afterAll(async () => {
    await Database.closeConnections();
  });
});