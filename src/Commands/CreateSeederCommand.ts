import fs from "fs";
import path from "path";
import { QueryBuilder } from "../QueryBuilder";
import { Database } from "../Database";

/**
 * Command to create a new seeder file.
 */
export class CreateSeederCommand {
  /**
   * Executes the command to create a seeder file for a specified table.
   * @param name - The name of the seeder.
   * @param table - The name of the table the seeder is for.
   */
  async execute(name: string, table: string): Promise<void> {
    const projectDir = process.cwd();
    const dirPath = path.join(projectDir, "src", "migrations", "seeder");
    const seederFilePath = path.join(dirPath, `${name}.ts`);

    fs.mkdirSync(dirPath, { recursive: true });

    const templatePath = path.join(__dirname, "./templates", "seeder.tpl");
    let seederTemplate = fs.readFileSync(templatePath, "utf-8");

    seederTemplate = seederTemplate.replace(/{{name}}/g, name);
    seederTemplate = seederTemplate.replace(/{{table}}/g, table);

    fs.writeFileSync(seederFilePath, seederTemplate.trim());
    console.log(`Seeder ${name} created for table ${table} in ${dirPath}.`);

    // Executa o seeder após a criação
    await this.runSeeder(name, table);
  }

  /**
   * Run the seeder for the specified table.
   * @param name - The name of the seeder.
   * @param table - The name of the table the seeder is for.
   */
  async runSeeder(name: string, table: string): Promise<void> {
    try {

      // Obtém a conexão
      const connection = await Database.getConnection();

      // Cria uma instância do QueryBuilder com a conexão
      const queryBuilder = new QueryBuilder(connection);

      // Importa o seeder dinamicamente
      const seederModule = await import(
        path.join(process.cwd(), "src", "migrations", "seeder", `${name}.ts`)
      );
      const SeederClass = seederModule[name];
      const seeder = new SeederClass(queryBuilder);

      // Executa o seeder
      await seeder.run();

      console.log(`Seeder ${name} executed successfully.`);
    } catch (error) {
      console.error("Error executing seeder:", error);
    } finally {
      // Fecha as conexões
      await Database.closeConnections();
    }
  }
}
