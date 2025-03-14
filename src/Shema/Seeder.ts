import { QueryBuilder } from "../QueryBuilder";

export abstract class Seeder {
  protected queryBuilder: QueryBuilder;

  constructor(queryBuilder: QueryBuilder) {
    this.queryBuilder = queryBuilder;
  }

  abstract run(): Promise<void>;

  protected insert(data: any[], table: string): Promise<any> {
    return this.queryBuilder.table(table).insert(data);
  }
}