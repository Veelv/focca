import { Connection } from "../Connection";
import { QueryBuilder } from "../QueryBuilder";
import { Entity } from "./Entity";

export class BelongsToMany {
  protected parent: Entity;
  protected related: Entity;
  protected table: string;
  protected foreignPivotKey: string;
  protected relatedPivotKey: string;
  protected query: QueryBuilder | null = null;
  protected pivotColumns: string[] = [];
  protected useTimestamps: boolean = false;
  protected connection: Connection | null = null;

  constructor(
    parent: Entity,
    related: Entity,
    table?: string,
    foreignPivotKey?: string,
    relatedPivotKey?: string
  ) {
    this.parent = parent;
    this.related = related;

    const modelNames = [
      this.parent.getModelNameString().toLowerCase(),
      this.related.getModelNameString().toLowerCase()
    ].sort();

    this.table = table || `${modelNames[0]}_${modelNames[1]}`;
    this.foreignPivotKey = foreignPivotKey || `${this.parent.getModelNameString().toLowerCase()}_id`;
    this.relatedPivotKey = relatedPivotKey || `${this.related.getModelNameString().toLowerCase()}_id`;
  }

  private async getConnection(): Promise<Connection> {
    if (!this.connection) {
      const relatedClass = this.related.constructor as typeof Entity;
      this.connection = await (relatedClass as any).getConnection();
    }
    return this.connection!;
  }

  private async createQuery(): Promise<QueryBuilder> {
    const connection = await this.getConnection();
    return new QueryBuilder(connection).table(this.table);
  }

  private async ensureQueryInitialized(): Promise<void> {
    if (!this.query) {
      this.query = await this.createQuery();
    }
  }

  public withPivot(...columns: string[]): BelongsToMany {
    this.pivotColumns = columns;
    return this;
  }

  public withTimestamps(createdAt: string = 'created_at', updatedAt: string = 'updated_at'): BelongsToMany {
    this.useTimestamps = true;
    this.pivotColumns.push(createdAt, updatedAt);
    return this;
  }

  public async wherePivot(column: string, operator: string, value: any): Promise<BelongsToMany> {
    await this.ensureQueryInitialized();
    this.query!.where(`${this.table}.${column}`, operator, value);
    return this;
  }

  public async wherePivotIn(column: string, values: any[]): Promise<BelongsToMany> {
    await this.ensureQueryInitialized();
    this.query!.whereIn(`${this.table}.${column}`, values);
    return this;
  }

  public async get(): Promise<Entity[]> {
    return this.getRelationResults();
  }

  public async attach(id: any | any[], attributes: Record<string, any> = {}): Promise<void> {
    const ids = Array.isArray(id) ? id : [id];
    const now = new Date();
    const records = [];

    const parentKey = (this.parent.constructor as typeof Entity).getPrimaryKeyName();
    const parentId = this.parent.getAttribute(parentKey);

    for (const relatedId of ids) {
      const record: Record<string, any> = {
        [this.foreignPivotKey]: parentId,
        [this.relatedPivotKey]: relatedId,
        ...attributes
      };

      if (this.useTimestamps) {
        record['created_at'] = now;
        record['updated_at'] = now;
      }

      records.push(record);
    }

    const query = await this.createQuery();
    await query.insert(records);
  }

  public async detach(id: any | any[] | null = null): Promise<void> {
    const parentKey = (this.parent.constructor as typeof Entity).getPrimaryKeyName();
    const parentId = this.parent.getAttribute(parentKey);

    const query = await this.createQuery();
    query.where(this.foreignPivotKey, '=', parentId);

    if (id !== null) {
      const ids = Array.isArray(id) ? id : [id];
      query.whereIn(this.relatedPivotKey, ids);
    }

    await query.delete();
  }

  public async sync(ids: any[]): Promise<void> {
    await this.detach();
    if (ids.length > 0) {
      await this.attach(ids);
    }
  }

  public async toggle(ids: any[]): Promise<{ attached: any[]; detached: any[] }> {
    const parentKey = (this.parent.constructor as typeof Entity).getPrimaryKeyName();
    const parentId = this.parent.getAttribute(parentKey);

    const query = await this.createQuery();
    query.where(this.foreignPivotKey, '=', parentId);
    const current = await query.get();

    const currentIds = current.map(record => record[this.relatedPivotKey]);

    const detach = ids.filter(id => currentIds.includes(id));
    const attach = ids.filter(id => !currentIds.includes(id));

    if (detach.length > 0) {
      await this.detach(detach);
    }

    if (attach.length > 0) {
      await this.attach(attach);
    }

    return { attached: attach, detached: detach };
  }

  public async updateExistingPivot(id: any, attributes: Record<string, any>): Promise<void> {
    const parentKey = (this.parent.constructor as typeof Entity).getPrimaryKeyName();
    const parentId = this.parent.getAttribute(parentKey);

    const query = await this.createQuery();
    query.where(this.foreignPivotKey, '=', parentId);
    query.where(this.relatedPivotKey, '=', id);

    if (this.useTimestamps) {
      attributes['updated_at'] = new Date();
    }

    await query.update(attributes);
  }

  protected async getRelationResults(): Promise<Entity[]> {
    const relatedClass = this.related.constructor as typeof Entity;
    const parentKey = (this.parent.constructor as typeof Entity).getPrimaryKeyName();
    const relatedKey = (relatedClass as typeof Entity).getPrimaryKeyName();
    const parentId = this.parent.getAttribute(parentKey);

    const relatedTable = (relatedClass as typeof Entity).getTableName();

    const query = await (relatedClass as any).query();
    query.join(this.table, `${relatedTable}.${relatedKey}`, '=', `${this.table}.${this.relatedPivotKey}`);
    query.where(`${this.table}.${this.foreignPivotKey}`, '=', parentId);

    const results = await query.get();
    return (relatedClass as any).hydrate(results);
  }
}