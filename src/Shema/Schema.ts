import { Connection } from "../Connection";
import { Blueprint } from "./Blueprint";
import { Database } from "../Database";

export class Schema {
  /**
   * Create a new database table
   */
  public static async create(
    table: string,
    callback: (blueprint: Blueprint) => void
  ): Promise<void> {
    const connection = await Database.getConnection();
    const blueprint = new Blueprint(table);
    callback(blueprint);

    const driver = this.getDriverName(connection);
    
    // Verificar e corrigir múltiplas chaves primárias
    this.validatePrimaryKeys(blueprint);
    
    const sql = blueprint.toSql(driver);

    await this.executeStatement(connection, sql, true); // Pass 'true' to indicate table creation

    for (const index of blueprint.getIndexes()) {
      const indexSql = this.createIndexSql(table, index, driver);
      await this.executeStatement(connection, indexSql);
    }

    for (const foreign of blueprint.getForeignKeys()) {
      const foreignSql = this.createForeignKeySql(table, foreign, driver);
      await this.executeStatement(connection, foreignSql);
    }
  }

  /**
   * Validate and fix primary keys to ensure only one primary key is defined
   */
  protected static validatePrimaryKeys(blueprint: Blueprint): void {
    const primaryColumns = blueprint.getColumns().filter(column => column.primary);
    
    // Se houver mais de uma coluna marcada como primary key
    if (primaryColumns.length > 1) {
      // Mantém apenas a primeira coluna como primary key
      for (let i = 1; i < primaryColumns.length; i++) {
        primaryColumns[i].primary = false;
      }
    }
  }

  /**
   * Drop a table if it exists
   */
  public static async dropIfExists(table: string): Promise<void> {
    const connection = await Database.getConnection();
    const driver = this.getDriverName(connection);
    const quotedTable = this.quoteIdentifier(table, driver);
    const sql = `DROP TABLE IF EXISTS ${quotedTable}`;
    await this.executeStatement(connection, sql);
  }

  protected static createIndexSql(
    table: string,
    index: any,
    driver: string
  ): string {
    const quotedTable = this.quoteIdentifier(table, driver);
    const indexName = index.name ?? `${table}_${index.columns[0]}_index`;
    const quotedIndexName = this.quoteIdentifier(indexName, driver);
    const columns = index.columns
      .map((column: string) => this.quoteIdentifier(column, driver))
      .join(", ");

    let type = "";
    if (index.type) {
      if (index.type === "unique") {
        type = "UNIQUE ";
      }
    }

    return `CREATE ${type}INDEX ${quotedIndexName} ON ${quotedTable} (${columns})`;
  }

  protected static createForeignKeySql(
    table: string,
    foreign: any,
    driver: string
  ): string {
    const quotedTable = this.quoteIdentifier(table, driver);
    const quotedColumn = this.quoteIdentifier(foreign.column, driver);
    const quotedForeignTable = this.quoteIdentifier(foreign.on, driver);
    const quotedForeignColumn = this.quoteIdentifier(
      foreign.references,
      driver
    );

    const constraintName = foreign.name ?? `${table}_${foreign.column}_foreign`;
    const quotedConstraintName = this.quoteIdentifier(constraintName, driver);

    let sql = `ALTER TABLE ${quotedTable} ADD CONSTRAINT ${quotedConstraintName} `;
    sql += `FOREIGN KEY (${quotedColumn}) REFERENCES ${quotedForeignTable} (${quotedForeignColumn})`;

    if (foreign.onDelete) {
      sql += ` ON DELETE ${foreign.onDelete}`;
    }

    if (foreign.onUpdate) {
      sql += ` ON UPDATE ${foreign.onUpdate}`;
    }

    return sql;
  }

  protected static async executeStatement(
    connection: Connection,
    sql: string,
    isTableCreation = false
  ): Promise<void> {
    try {
      await connection.query(sql);
    } catch (e: any) {
      // For table creation, if table already exists, we don't want to fail the entire migration
      if (isTableCreation && e.code === "ER_TABLE_EXISTS_ERROR") {
        throw e; // Let the MigrateCommand handle this specific error
      } else if (e.code === "ER_DUP_KEYNAME" || e.code === "ER_DUP_ENTRY") {
        // Index or constraint already exists, just log and continue
        console.warn(`Warning: ${e.message}`);
      } else {
        console.error("Error executing SQL: " + e.message);
        throw e;
      }
    }
  }

  protected static getDriverName(connection: Connection): string {
    const driver = connection.getDriver().constructor.name;
    return driver;
  }

  protected static quoteIdentifier(identifier: string, driver: string): string {
    switch (driver) {
      case "MySqlDriver":
        return `\`${identifier}\``;
      case "PostgresDriver":
      case "SqliteDriver":
        return `"${identifier}"`;
      case "SqlServerDriver":
        return `[${identifier}]`;
      default:
        return identifier;
    }
  }
}