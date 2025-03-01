import fs from "fs";
import path from "path";
import { Migration } from "../cli/Migration";

/**
 * Command to rollback the last applied migration.
 */
export class RollbackCommand {
  /**
   * Executes the command to revert the last migration.
   */
  async execute(): Promise<void> {
    const migrations = await this.loadMigrations();
    const lastMigration = migrations.pop(); // Get the last migration
    if (lastMigration) {
      // Revert the last migration
      await lastMigration.down();
      console.log(`Migration ${lastMigration.constructor.name} reverted.`);
    } else {
      console.log("No migrations to revert.");
    }
  }

  /**
   * Loads all migration classes from the migrations directory.
   * @returns An array of migration instances.
   */
  private async loadMigrations(): Promise<Migration[]> {
    const migrations: Migration[] = [];
    const migrationsDir = path.join(__dirname, '../migrations');

    // Read all migration files in the directory
    const files = fs.readdirSync(migrationsDir);
    
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
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
      }
    }

    return migrations;
  }
}