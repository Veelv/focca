import { RollbackCommand } from './RollbackCommand';
import { MigrateCommand } from './MigrateCommand';

/**
 * Command to refresh the database by rolling back all migrations and reapplying them.
 */
export class FreshCommand {
  /**
   * Executes the command to reset the database and apply all migrations from scratch.
   */
  async execute(): Promise<void> {
    const rollback = new RollbackCommand();
    // Rollback all migrations
    await rollback.execute();
    // Logic to remove all tables (not implemented here)
    const migrate = new MigrateCommand();
    // Reapply all migrations
    await migrate.execute();
    console.log('Database created from scratch.');
  }
}