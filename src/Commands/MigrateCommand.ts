import { Migration } from '../cli/Migration'
import { Database } from '../Database'
import fs from 'fs'
import path from 'path'

/**
 * Command to execute all pending migrations.
 */
export class MigrateCommand {
  private migrationsTableName = 'migrations'

  // Color codes for console output
  private colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    white: '\x1b[37m',
  }

  /**
   * Executes the command to apply all migrations.
   */
  async execute(): Promise<void> {
    await this.createMigrationsTable()

    const appliedMigrations = await this.getAppliedMigrations()
    const migrations = await this.loadMigrations()

    const pendingMigrations = migrations.filter(
      (migration) => !appliedMigrations.includes(migration.constructor.name),
    )

    if (pendingMigrations.length === 0) {
      console.log(
        `${this.colors.blue}Nothing to migrate. All migrations have already been applied.${this.colors.reset}`,
      )
      return
    }

    console.log(`${this.colors.blue}Running migrations:${this.colors.reset}`)

    let successCount = 0
    let failedCount = 0

    for (const migration of pendingMigrations) {
      try {
        const tableExists = await this.checkIfTableExists(
          migration.constructor.name,
        )
        if (tableExists) {
          console.log(
            `${this.colors.yellow}Skipping migration ${migration.constructor.name} because the table already exists.${this.colors.reset}`,
          )
          continue
        }

        await migration.up()
        
        await this.recordMigration(migration.constructor.name)
        successCount++

        console.log(
          `${this.colors.green}✓ Migration ${migration.constructor.name} applied successfully.${this.colors.reset}`,
        )
      } catch (error: any) {
        failedCount++

        console.error(
          `${this.colors.red}✗ Error applying migration ${migration.constructor.name}: ${error.message}${this.colors.reset}`,
        )
      }
    }
    
    console.log(`\n${this.colors.blue}Migration Summary:${this.colors.reset}`)
    if (successCount > 0)
      console.log(
        `${this.colors.green}${successCount} migrations applied successfully${this.colors.reset}`,
      )
    if (failedCount > 0)
      console.log(
        `${this.colors.red}${failedCount} migrations failed${this.colors.reset}`,
      )

      process.exit(0);
  }

  /**
   * Check if a table exists in the database.
   * @param tableName The name of the table to be checked.
   * @returns True if the table exists, false otherwise.
   */
  private async checkIfTableExists(tableName: string): Promise<boolean> {
    const connection = await Database.getConnection()
    try {
      const result = await connection.query(`SHOW TABLES LIKE ?`, [tableName])
      return result.length > 0
    } catch (error) {
      console.error(
        `${this.colors.red}Failed to check if table ${tableName} exists: ${error}${this.colors.reset}`,
      )
      return false // Retorna falso em caso de erro
    }
  }

  /**
   * Creates the migrations table if it does not exist.
   */
  private async createMigrationsTable(): Promise<void> {
    const connection = await Database.getConnection()

    try {
      const query = `
        CREATE TABLE IF NOT EXISTS ${this.migrationsTableName} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      await connection.query(query)
    } catch (error) {
      console.error(
        `${this.colors.red}Failed to create migrations table: ${error}${this.colors.reset}`,
      )
      throw error
    }
  }

  /**
   * Gets a list of migrations that have already been applied.
   * @returns An array of migration names.
   */
  private async getAppliedMigrations(): Promise<string[]> {
    const connection = await Database.getConnection()

    try {
      const results = await connection.query(
        `SELECT name FROM ${this.migrationsTableName}`,
      )
      return results.map((row: any) => row.name)
    } catch (error) {
      console.error(
        `${this.colors.red}Failed to retrieve applied migrations: ${error}${this.colors.reset}`,
      )
      return []
    }
  }

  /**
   * Loads all migration classes from the migrations directory.
   * @returns An array of migration instances.
   */
  private async loadMigrations(): Promise<Migration[]> {
    const migrations: Migration[] = []
    const migrationsDir = path.join(process.cwd(), './src/migrations/database')

    // Ensure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.warn(
        `${this.colors.yellow}Migrations directory not found: ${migrationsDir}${this.colors.reset}`,
      )
      return migrations
    }

    // Register ts-node once at the beginning
    try {
      // This ensures ts-node is registered before any TypeScript files are loaded
      require('ts-node/register')
    } catch (tsNodeError) {
      console.warn(
        `${this.colors.yellow}ts-node not found, TypeScript files may not load correctly. Consider installing ts-node.${this.colors.reset}`,
      )
    }

    // Read all migration files in the directory
    const files = fs.readdirSync(migrationsDir)

    for (const file of files) {
      // Handle both .js and .ts files
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        try {
          // Import the migration file
          const migrationPath = path.join(migrationsDir, file)

          // Clean cache to ensure we're getting the latest version
          delete require.cache[require.resolve(migrationPath)]

          let migrationModule

          try {
            // Try to import the file (ts-node should handle TypeScript files if registered)
            migrationModule = require(migrationPath)
          } catch (importError: any) {
            console.error(
              `${this.colors.red}Failed to load migration file ${file}: ${importError.message}${this.colors.reset}`,
            )
            continue
          }

          // Get the default exported class or the first class that extends Migration
          let MigrationClass = migrationModule.default || null

          // If no default export found, look for named exports
          if (!MigrationClass) {
            for (const key in migrationModule) {
              if (
                typeof migrationModule[key] === 'function' &&
                migrationModule[key].prototype instanceof Migration
              ) {
                MigrationClass = migrationModule[key]
                break
              }
            }
          }

          if (MigrationClass && typeof MigrationClass === 'function') {
            const migrationInstance = new MigrationClass()
            migrations.push(migrationInstance)
          } else {
            console.warn(
              `${this.colors.yellow}No valid migration class found in ${file}${this.colors.reset}`,
            )
          }
        } catch (error: any) {
          console.error(
            `${this.colors.red}Failed to load migration file ${file}: ${error.message}${this.colors.reset}`,
          )
        }
      }
    }

    // Sort migrations by filename to ensure they're executed in the correct order
    migrations.sort((a, b) => {
      return a.constructor.name.localeCompare(b.constructor.name)
    })

    return migrations
  }

  /**
   * Records the applied migration in the database.
   * @param migrationName The name of the migration to record.
   */
  private async recordMigration(migrationName: string): Promise<void> {
    const connection = await Database.getConnection()

    try {
      // Check if migration record already exists
      const existingRows = await connection.query(
        `SELECT * FROM ${this.migrationsTableName} WHERE name = ?`,
        [migrationName],
      )

      if (existingRows.length === 0) {
        const query = `INSERT INTO ${this.migrationsTableName} (name) VALUES (?)`
        await connection.query(query, [migrationName])
      }
    } catch (error) {
      console.error(
        `${this.colors.red}Failed to record migration ${migrationName}: ${error}${this.colors.reset}`,
      )
      throw error
    }
  }
}
