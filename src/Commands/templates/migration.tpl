import { Migration } from './Migration';
// import { Migration, Schema } from 'focca';

export class {{name}} extends Migration {
  /**
* Run the migrations.
*
* @return void
*/
  async up(): Promise<void> {
    // Lógica para aplicar a migração
  }

  /**
* Revert the migrations.
*
* @return void
*/
  async down(): Promise<void> {
    // Lógica para reverter a migração
  }
}