#!/usr/bin/env node
import { CreateConfigCommand } from "../Commands/CreateConfigCommand";
import { CreateMigrationCommand } from "../Commands/CreateMigrationCommand";
import { CreateModelCommand } from "../Commands/CreateModelCommand";
import { CreateSeederCommand } from "../Commands/CreateSeederCommand";
import { FreshCommand } from "../Commands/FreshCommand";
import { ListCommandsCommand } from "../Commands/ListCommandsCommand";
import { MigrateCommand } from "../Commands/MigrateCommand";
import { RefreshCommand } from "../Commands/RefreshCommand";
import { RollbackCommand } from "../Commands/RollbackCommand";
import { Version } from "../utils/Version";

const command = process.argv[2];
const args = process.argv.slice(3);

async function runCommand() {
  switch (command) {
    case "info":
      console.log(`\x1b[32mAPP NAME\x1b[0m: ${Version.getName()}`);
      console.log(`\x1b[32mAPP VERSION\x1b[0m: ${Version.getVersion()}`);
      console.log(
        `\x1b[32mAPP DESCRIPTION\x1b[0m: ${Version.getDescription()}`
      );
      break;
    case "create:migration":
      const migrationCommand = new CreateMigrationCommand();
      await migrationCommand.execute(args[0]);
      break;
    case "create:entity":
      const modelCommand = new CreateModelCommand();
      await modelCommand.execute(args[0]);
      break;
    case "create:seeder":
      const seederCommand = new CreateSeederCommand();
      await seederCommand.execute(args[0]);
      break;
    case "migrate":
      const migrateCommand = new MigrateCommand();
      await migrateCommand.execute();
      break;
    case "rollback":
      const rollbackCommand = new RollbackCommand();
      await rollbackCommand.execute();
      break;
    case "refresh":
      const refreshCommand = new RefreshCommand();
      await refreshCommand.execute();
      break;
    case "fresh":
      const freshCommand = new FreshCommand();
      await freshCommand.execute();
      break;
    case "config:database":
      const configCommand = new CreateConfigCommand();
      await configCommand.execute(args);
      break;
    case "config:refresh":
      const updateConfigCommand = new CreateConfigCommand();
      await updateConfigCommand.execute(args, { update: true });
      break;
    case "config:remove":
      const removeConfigCommand = new CreateConfigCommand();
      await removeConfigCommand.execute(args, { remove: true });
      break;
    case "run:seeder":
      if (args[0] === 'run:seeder') {
        const seederCommand = new CreateSeederCommand();
        await seederCommand.execute(args[1]);
      }
      const runSeederCommand = new CreateSeederCommand();
      await runSeederCommand.runSeeder(args[0]);
      break;
    case "list":
      const listCommand = new ListCommandsCommand();
      await listCommand.execute();
      break;
    default:
      const commands = new ListCommandsCommand();
      await commands.execute();
  }
}

runCommand().catch((err) => {
  console.error(err);
  process.exit(1);
});
