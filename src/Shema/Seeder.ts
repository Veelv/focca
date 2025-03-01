import { QueryBuilder } from "../QueryBuilder";

export abstract class Seeder {
  protected queryBuilder: QueryBuilder;

  constructor(queryBuilder: QueryBuilder) {
    this.queryBuilder = queryBuilder;
  }

  abstract run(): void;

  protected insert(table: string, data: any[]): void {
    this.queryBuilder.table(table).insert(data);
  }
}