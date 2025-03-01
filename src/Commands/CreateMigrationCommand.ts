import fs from "fs";
import path from "path";

/**
 * Command to create a new migration file.
 */
export class CreateMigrationCommand {
  /**
   * Executes the command to create a migration file with a timestamp and specified name.
   * @param name - The name of the migration.
   */
  async execute(name: string): Promise<void> {
    // Generate a timestamp for the migration file name
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, 14);
    const migrationFileName = `${timestamp}_${name}.ts`;
    const projectDir = process.cwd();
    const dirPath = path.join(projectDir, "src/migrations/database",);
    const migrationFilePath = path.join(dirPath, `${migrationFileName}`);

   

    // Read the migration template from the file
    const templatePath = path.join(__dirname, './templates', 'migration.tpl');
    let migrationTemplate = fs.readFileSync(templatePath, 'utf-8');

    // Replace placeholders in the template
    migrationTemplate = migrationTemplate.replace(/{{name}}/g, name);
    fs.mkdirSync(dirPath, { recursive: true });
    // Write the migration file to the filesystem
    fs.writeFileSync(migrationFilePath, migrationTemplate.trim());
    console.log(`Migration created: ${migrationFileName}`);
  }
}