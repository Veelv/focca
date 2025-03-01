import { Migration } from "../cli/Migration";
import { Database } from "../Database";
import fs from 'fs';
import path from 'path';

/**
 * Command to execute all pending migrations.
 */
export class MigrateCommand {
  private migrationsTableName = 'migrations';
  
  // Color codes for console output
  private colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    white: "\x1b[37m"
  };

  /**
   * Executes the command to apply all migrations.
   */
  async execute(): Promise<void> {
    await this.createMigrationsTable();
  
    // Get already applied migrations
    const appliedMigrations = await this.getAppliedMigrations();
  
    // Load all available migrations
    const migrations = await this.loadMigrations();
  
    // Filter out migrations that have already been applied
    const pendingMigrations = migrations.filter(
      (migration) => !appliedMigrations.includes(migration.constructor.name)
    );
  
    if (pendingMigrations.length === 0) {
      console.log(
        `${this.colors.blue}Nothing to migrate. All migrations have already been applied.${this.colors.reset}`
      );
      return;
    }
  
    console.log(`${this.colors.blue}Running migrations:${this.colors.reset}`);
  
    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
  
    for (const migration of pendingMigrations) {
      try {
        // Apply each migration
        await migration.up();
        
        // Only record and print success message if no errors were thrown
        await this.recordMigration(migration.constructor.name);
        successCount++;
        console.log(
          `${this.colors.green}✓ Migration ${migration.constructor.name} applied successfully.${this.colors.reset}`
        );
      } catch (error: any) {
        if (error.code === "ER_TABLE_EXISTS_ERROR") {
          // Table already exists, but migration wasn't recorded
          skippedCount++;
          console.log(
            `${this.colors.yellow}⚠ Migration ${migration.constructor.name} skipped: ${error.sqlMessage}${this.colors.reset}`
          );
  
          // Still record this migration to prevent future attempts
          await this.recordMigration(migration.constructor.name);
        } else {
          failedCount++;
          console.error(
            `${this.colors.red}✗ Error applying migration ${migration.constructor.name}: ${error.message}${this.colors.reset}`
          );
          // Do not record failed migrations
        }
      }
    }
  
    // Print summary
    console.log(`\n${this.colors.blue}Migration Summary:${this.colors.reset}`);
    if (successCount > 0)
      console.log(
        `${this.colors.green}${successCount} migrations applied successfully${this.colors.reset}`
      );
    if (skippedCount > 0)
      console.log(
        `${this.colors.yellow}${skippedCount} migrations skipped (tables exist)${this.colors.reset}`
      );
    if (failedCount > 0)
      console.log(
        `${this.colors.red}${failedCount} migrations failed${this.colors.reset}`
      );
  }
  /**
   * Creates the migrations table if it does not exist.
   */
  private async createMigrationsTable(): Promise<void> {
    const connection = await Database.getConnection();
    
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS ${this.migrationsTableName} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await connection.query(query);
    } catch (error) {
      console.error(`${this.colors.red}Failed to create migrations table: ${error}${this.colors.reset}`);
      throw error;
    }
  }

  /**
   * Gets a list of migrations that have already been applied.
   * @returns An array of migration names.
   */
  private async getAppliedMigrations(): Promise<string[]> {
    const connection = await Database.getConnection();
    
    try {
      const results = await connection.query(`SELECT name FROM ${this.migrationsTableName}`);
      return results.map((row: any) => row.name);
    } catch (error) {
      console.error(`${this.colors.red}Failed to retrieve applied migrations: ${error}${this.colors.reset}`);
      return [];
    }
  }

  /**
   * Loads all migration classes from the migrations directory.
   * @returns An array of migration instances.
   */
  private async loadMigrations(): Promise<Migration[]> {
    const migrations: Migration[] = [];
    const migrationsDir = path.join(process.cwd(), './src/migrations/database');

    // Ensure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.warn(`${this.colors.yellow}Migrations directory not found: ${migrationsDir}${this.colors.reset}`);
      return migrations;
    }

    // Read all migration files in the directory
    const files = fs.readdirSync(migrationsDir);
    
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        try {
          const migrationModule = await import(path.join(migrationsDir, file));
          
          // Find the migration class
          const migrationClass = Object.values(migrationModule).find(
            (exported) => typeof exported === 'function' && 
            (exported.prototype instanceof Migration) // Check if it's a subclass of Migration
          ) as new () => Migration; // Assert that it's a class that can be instantiated

          if (migrationClass) {
            const migrationInstance = new migrationClass();
            migrations.push(migrationInstance);
          }
        } catch (error) {
          console.error(`${this.colors.red}Failed to load migration file ${file}: ${error}${this.colors.reset}`);
        }
      }
    }

    return migrations;
  }

  /**
   * Records the applied migration in the database.
   * @param migrationName The name of the migration to record.
   */
  private async recordMigration(migrationName: string): Promise<void> {
    const connection = await Database.getConnection();
    
    try {
      // Check if migration record already exists
      const existingRows = await connection.query(
        `SELECT * FROM ${this.migrationsTableName} WHERE name = ?`, 
        [migrationName]
      );
      
      if (existingRows.length === 0) {
        const query = `INSERT INTO ${this.migrationsTableName} (name) VALUES (?)`;
        await connection.query(query, [migrationName]);
      }
    } catch (error) {
      console.error(`${this.colors.red}Failed to record migration ${migrationName}: ${error}${this.colors.reset}`);
      throw error;
    }
  }
}