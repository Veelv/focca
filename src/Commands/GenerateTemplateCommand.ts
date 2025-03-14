import fs from "fs";
import path from "path";

export class GenerateTemplateCommand {
  async execute(type: string, name: string, table?: string): Promise<void> {
    const template = await this.getTemplate(type, name, table);
    const projectDir = process.cwd();
    
    // Ajusta para criar "Entities" ao invés de "Entitys"
    const capitalizedType = type.toLowerCase() === "entity" ? "Entities" : type.charAt(0).toUpperCase() + type.slice(1) + "s";
    
    const dirPath = path.join(projectDir, "src", capitalizedType);
    const filePath = path.join(dirPath, `${name}.ts`);

    // Create the directory if it doesn't exist
    fs.mkdirSync(dirPath, { recursive: true });

    // Write the generated template to the filesystem
    fs.writeFileSync(filePath, template.trim());
    console.log(`${capitalizedType} ${name} created in ${dirPath}.`);
  }

  private async getTemplate(
    type: string,
    name: string,
    table?: string
  ): Promise<string> {
    // Busca o template no diretório atual primeiro
    const templatePath = path.join(__dirname, "../templates", `${type}.tpl`);
    
    // Verificar se o template existe
    if (!fs.existsSync(templatePath)) {
      console.error(`Template não encontrado: ${templatePath}`);
      // Tentar caminho alternativo - pacote instalado
      const altTemplatePath = path.join(__dirname, "../../templates", `${type}.tpl`);
      if (fs.existsSync(altTemplatePath)) {
        console.log(`Template encontrado em caminho alternativo: ${altTemplatePath}`);
        let template = fs.readFileSync(altTemplatePath, "utf-8");
        
        // Replace placeholders in the template
        template = template.replace(/{{name}}/g, name);
        if (table) {
          template = template.replace(/{{table}}/g, table);
        }
        
        return template;
      }
      return `// Template for ${type} not found. Please create a template file.`;
    }
    
    let template = fs.readFileSync(templatePath, "utf-8");
    
    // Replace placeholders in the template
    template = template.replace(/{{name}}/g, name);
    if (table) {
      template = template.replace(/{{table}}/g, table);
    }
    
    return template;
  }
}