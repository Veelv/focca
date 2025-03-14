import fs from "fs";
import path from "path";
import { QueryBuilder } from "../QueryBuilder";
import { Database } from "../Database";

export class CreateSeederCommand {
  async execute(name: string): Promise<void> {
    const projectDir = process.cwd();
    const dirPath = path.join(projectDir, "src", "migrations", "seeder");
    const seederFilePath = path.join(dirPath, `${name}.ts`);

    fs.mkdirSync(dirPath, { recursive: true });

    // Use __dirname para localizar os templates em relação ao arquivo atual
    const templatePath = path.join(__dirname, "../templates", "seeder.tpl");
    
    // Verificar se o template existe
    if (!fs.existsSync(templatePath)) {
      console.error(`Template não encontrado: ${templatePath}`);
      // Tentar caminho alternativo - pacote instalado
      const altTemplatePath = path.join(__dirname, "../../templates", "seeder.tpl");
      if (fs.existsSync(altTemplatePath)) {
        console.log(`Template encontrado em caminho alternativo: ${altTemplatePath}`);
        let seederTemplate = fs.readFileSync(altTemplatePath, "utf-8");
        seederTemplate = seederTemplate.replace(/{{name}}/g, name);
        // Remover a substituição da tabela, pois agora é gerenciada dentro do seeder

        fs.writeFileSync(seederFilePath, seederTemplate.trim());
        console.log(`Seeder ${name} created in ${dirPath}.`);
        return;
      }
      return;
    }

    let seederTemplate = fs.readFileSync(templatePath, "utf-8");
    seederTemplate = seederTemplate.replace(/{{name}}/g, name);
    // Remover a substituição da tabela, pois agora é gerenciada dentro do seeder

    fs.writeFileSync(seederFilePath, seederTemplate.trim());
    console.log(`Seeder ${name} created in ${dirPath}.`);

    // Executa o seeder após a criação
    await this.runSeeder(name);
  }

  async runSeeder(name: string): Promise<void> {
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