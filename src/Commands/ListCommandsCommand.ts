/**
 * Command to list all available commands in the CLI.
 */
export class ListCommandsCommand {
  /**
   * Executes the command to display a list of available commands.
   */
  async execute(): Promise<void> {
    console.log("Available commands:");
    console.log("  │ " + "\x1b[32mCommands\x1b[0m                      │ Descriptions                                         │");
    console.log("  │ " + "\x1b[32minfo\x1b[0m                          │ Execute informations app                             │");
    console.log("  │ " + "\x1b[32mmigrate\x1b[0m                       │ Executes all pending migrations                      │");
    console.log("  │ " + "\x1b[32mrollback\x1b[0m                      │ Reverts the last migration                           │");
    console.log("  │ " + "\x1b[32mrefresh\x1b[0m                       │ Rolls back all migrations and reapplies them         │");
    console.log("  │ " + "\x1b[32mfresh\x1b[0m                         │ Removes all tables and executes all migrations again │");
    console.log("  │ " + "\x1b[32mconfig:database\x1b[0m               │ Configures one or more databases                     │");
    console.log("  │ " + "\x1b[32mconfig:update\x1b[0m                 │ Updates the databases                                │");
    console.log("  │ " + "\x1b[32mconfig:remove\x1b[0m                 │ remove the databases                                 │");
    console.log("  │ " + "\x1b[32mcreate:entity\x1b[0m                 │ Creates a new entity                                 │");
    console.log("  │ " + "\x1b[32mcreate:migration\x1b[0m              │ Creates a new migration                              │");
    console.log("  │ " + "\x1b[32mcreate:seeder\x1b[0m                 │ Creates a new seeder                                 │");
    console.log("  │ " + "\x1b[32mrun:seeder\x1b[0m                    │ Creates a new seeder                                 │");
  }
}