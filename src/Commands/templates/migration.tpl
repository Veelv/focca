import { Blueprint, Migration, Schema } from 'focca';

export default class {{name}} extends Migration {
  /**
  * Run the migrations.
  *
  * @return void
  */
  async up(): Promise<void> {
    // 
  }

  /**
  * Revert the migrations.
  *
  * @return void
  */
  async down(): Promise<void> {
    await Schema.dropIfExists('table_name');
  }
}