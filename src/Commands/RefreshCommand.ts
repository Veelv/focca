import { RollbackCommand } from './RollbackCommand';
import { MigrateCommand } from './MigrateCommand';

/**
 * Command to refresh the database by rolling back all migrations and reapplying them.
 */
export class RefreshCommand {
  /**
   * Executes the command to rollback all migrations and reapply them.
   */
  async execute(): Promise<void> {
    const rollback = new RollbackCommand();
    // Rollback all migrations
    await rollback.execute();
    const migrate = new MigrateCommand();
    // Reapply all migrations
    await migrate.execute();
    console.log('Database updated.');
  }
}