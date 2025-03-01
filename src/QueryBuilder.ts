import { Connection } from "./Connection";

export class QueryBuilder {
  private tableName: string | null = null;
  private selectFields: string[] = [];
  private whereConditions: string[] = [];
  private whereInConditions: { field: string; values: any[] }[] = [];
  private orderByFields: string[] = [];
  private limitCount: number | null = null;
  private offsetCount: number | null = null;
  private joinClauses: string[] = [];
  private insertData: Record<string, any> | null = null;
  private updateData: Record<string, any> | null = null;
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  table(table: string): this {
    this.tableName = table;
    return this;
  }

  select(...fields: string[]): this {
    this.selectFields = fields;
    return this;
  }

  where(field: string, operator: string, value: any): this {
    this.whereConditions.push(
      `${field} ${operator} ${this.escapeValue(value)}`
    );
    return this;
  }

  whereIn(field: string, values: any[]): this {
    this.whereInConditions.push({ field, values });
    return this;
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc"): this {
    this.orderByFields.push(`${field} ${direction}`);
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  offset(count: number): this {
    this.offsetCount = count;
    return this;
  }

  join(table: string, first: string, operator: string, second: string): this {
    this.joinClauses.push(`JOIN ${table} ON ${first} ${operator} ${second}`);
    return this;
  }

  insert(data: Record<string, any>): Promise<any> {
    this.insertData = data;
    return this.executeInsert();
  }

  update(data: Record<string, any>): Promise<any> {
    this.updateData = data;
    return this.executeUpdate();
  }

  async get(): Promise<any[]> {
    const sql = this.buildSelectQuery();
    return this.executeQuery(sql);
  }

  async first(): Promise<any | null> {
    const results = await this.limit(1).get();
    return results.length ? results[0] : null;
  }

  async delete(): Promise<boolean> {
    const sql = this.buildDeleteQuery();
    await this.executeQuery(sql);
    return true;
  }

  private buildSelectQuery(): string {
    const fields = this.selectFields.length
      ? this.selectFields.join(", ")
      : "*";
    let sql = `SELECT ${fields} FROM ${this.tableName}`;

    if (this.joinClauses.length) {
      sql += " " + this.joinClauses.join(" ");
    }

    if (this.whereConditions.length) {
      sql += " WHERE " + this.whereConditions.join(" AND ");
    }

    if (this.whereInConditions.length) {
      const wherePrefix = this.whereConditions.length ? " AND " : " WHERE ";
      const whereInClauses = this.whereInConditions.map((condition) => {
        const escapedValues = condition.values
          .map((value) => this.escapeValue(value))
          .join(", ");
        return `${condition.field} IN (${escapedValues})`;
      });
      sql += wherePrefix + whereInClauses.join(" AND ");
    }

    if (this.orderByFields.length) {
      sql += " ORDER BY " + this.orderByFields.join(", ");
    }

    if (this.limitCount !== null) {
      sql += ` LIMIT ${this.limitCount}`;
    }

    if (this.offsetCount !== null) {
      sql += ` OFFSET ${this.offsetCount}`;
    }

    return sql;
  }

  private buildDeleteQuery(): string {
    if (!this.tableName) {
      throw new Error("Table name is required for delete operation");
    }

    let sql = `DELETE FROM ${this.tableName}`;

    if (this.whereConditions.length) {
      sql += " WHERE " + this.whereConditions.join(" AND ");
    }

    if (this.whereInConditions.length) {
      const wherePrefix = this.whereConditions.length ? " AND " : " WHERE ";
      const whereInClauses = this.whereInConditions.map((condition) => {
        const escapedValues = condition.values
          .map((value) => this.escapeValue(value))
          .join(", ");
        return `${condition.field} IN (${escapedValues})`;
      });
      sql += wherePrefix + whereInClauses.join(" AND ");
    }

    return sql;
  }

  private async executeInsert(): Promise<any> {
    if (!this.tableName || !this.insertData) {
      throw new Error("Table name and data are required for insert operation");
    }
    
    if (!Array.isArray(this.insertData)) {
      throw new Error("Insert data must be an array of objects");
    }
    
    const fields = Object.keys(this.insertData[0]).join(", ");
    
    const values = this.insertData
      .map((data) => {
        return `(${Object.values(data)
          .map((value) => this.escapeValue(value))
          .join(", ")})`;
      })
      .join(", ");

    const sql = `INSERT INTO ${this.tableName} (${fields}) VALUES ${values}`;
    return this.executeQuery(sql);
  }

  private async executeUpdate(): Promise<any> {
    if (!this.tableName || !this.updateData) {
      throw new Error("Table name and data are required for update operation");
    }

    const updates = Object.entries(this.updateData)
      .map(([key, value]) => `${key} = ${this.escapeValue(value)}`)
      .join(", ");

    let sql = `UPDATE ${this.tableName} SET ${updates}`;

    if (this.whereConditions.length) {
      sql += " WHERE " + this.whereConditions.join(" AND ");
    }

    if (this.whereInConditions.length) {
      const wherePrefix = this.whereConditions.length ? " AND " : " WHERE ";
      const whereInClauses = this.whereInConditions.map((condition) => {
        const escapedValues = condition.values
          .map((value) => this.escapeValue(value))
          .join(", ");
        return `${condition.field} IN (${escapedValues})`;
      });
      sql += wherePrefix + whereInClauses.join(" AND ");
    }

    return this.executeQuery(sql);
  }

  private async executeQuery(sql: string): Promise<any[]> {
    const results = await this.connection.query(sql);
    return results;
  }

  private escapeValue(value: any): string {
    if (typeof value === "string") {
      return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
    }
    if (value === null) {
      return "NULL";
    }
    return value.toString();
  }
}
