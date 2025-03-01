import { GenerateTemplateCommand } from './GenerateTemplateCommand';

/**
 * Command to create a new model file.
 */
export class CreateModelCommand {
  /**
   * Executes the command to create a model file with the specified name.
   * @param name - The name of the model.
   */
  async execute(name: string): Promise<void> {
    const generator = new GenerateTemplateCommand();
    // Generate the model template
    await generator.execute('entity', name, '');
    console.log(`Model ${name} created.`);
  }
}