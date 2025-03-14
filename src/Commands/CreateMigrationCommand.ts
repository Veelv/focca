import fs from "fs";
import path from "path";

export class CreateMigrationCommand {
  async execute(name: string): Promise<void> {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, 14);
    
    // Nome do arquivo sempre minúsculo
    const migrationFileName = `${timestamp}_${name.toLowerCase()}.ts`;

    // Nome da classe começa com maiúscula e vem antes do timestamp
    const className = `${name.charAt(0).toUpperCase() + name.slice(1)}${timestamp}`;

    const projectDir = process.cwd();
    const dirPath = path.join(projectDir, "src/migrations/database");
    const migrationFilePath = path.join(dirPath, migrationFileName);

    // Procura o template em relação ao diretório atual
    const templatePath = path.join(__dirname, "../templates", "migration.tpl");

    // Verificar se o template existe
    if (!fs.existsSync(templatePath)) {
      console.error(`Template não encontrado: ${templatePath}`);
      // Tentar caminho alternativo - pacote instalado
      const altTemplatePath = path.join(__dirname, "../../templates", "migration.tpl");
      if (fs.existsSync(altTemplatePath)) {
        console.log(`Template encontrado em caminho alternativo: ${altTemplatePath}`);
        let migrationTemplate = fs.readFileSync(altTemplatePath, "utf-8");
        migrationTemplate = migrationTemplate.replace(/{{name}}/g, className);
        
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(migrationFilePath, migrationTemplate.trim());
        console.log(`Migration created: ${migrationFileName}`);
        return;
      }
      return;
    }

    let migrationTemplate = fs.readFileSync(templatePath, "utf-8");
    migrationTemplate = migrationTemplate.replace(/{{name}}/g, className);
    
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(migrationFilePath, migrationTemplate.trim());
    console.log(`Migration created: ${migrationFileName}`);
  }
}
