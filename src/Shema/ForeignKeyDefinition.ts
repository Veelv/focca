import { Blueprint } from "./Blueprint";

export class ForeignKeyDefinition {
  protected blueprint: Blueprint;
  protected columns: string | string[];
  protected targetTable: string | null = null;
  protected targetColumns: string | null = null;
  protected deleteAction: string = 'RESTRICT';
  protected updateAction: string = 'RESTRICT';
  protected constraintName: string | null = null;

  constructor(blueprint: Blueprint, columns: string | string[]) {
    this.blueprint = blueprint;
    this.columns = columns;
  }

  public references(columns: string): ForeignKeyDefinition {
    this.targetColumns = columns;
    return this;
  }

  public on(table: string): ForeignKeyDefinition {
    this.targetTable = table;
    return this;
  }

  public onDelete(action: string): ForeignKeyDefinition {
    this.deleteAction = action;
    return this;
  }

  public onUpdate(action: string): ForeignKeyDefinition {
    this.updateAction = action;
    return this;
  }

  public getForeignKeyDefinition(): any {
    if (!this.targetTable || !this.targetColumns) {
      throw new Error('Foreign key constraint requires table and referenced column');
    }

    const column = typeof this.columns === 'string' ? this.columns : this.columns[0];

    // Adiciona a chave estrangeira ao blueprint
    this.blueprint.addForeignKey({
      column,
      on: this.targetTable,
      references: this.targetColumns,
      onDelete: this.deleteAction,
      onUpdate: this.updateAction,
      name: this.constraintName || `${this.blueprint.getTable()}_${column}_foreign`
    });

    return this;
  }
}