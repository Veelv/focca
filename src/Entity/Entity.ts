import { Connection } from "../Connection";
import { Database } from "../Database";
import { QueryBuilder } from "../QueryBuilder";
import { Validator } from "../Validator";
import { BelongsToMany } from "./BelongsToMany";

export class Entity {
  protected static table: string;
  protected static primaryKey: string = "id";
  protected static connection: string | null = null;
  protected static timestamps: boolean = true;
  protected static softDeletes: boolean = false;
  protected static fillable: string[] = [];
  protected static hidden: string[] = [];
  protected static casts: Record<string, string> = {};
  protected static appends: string[] = [];
  
  private static booted: Record<string, boolean> = {};
  
  protected static events: Record<string, Function[]> = {};
  
  protected static boot(): void {
    // Default initialization here
  }
  
  protected static bootIfNotBooted(): void {
    const modelName = this.name;
    
    if (!this.booted[modelName]) {
      this.booted[modelName] = true;
      
      this.events = {
        'saving': [],
        'saved': [],
        'creating': [],
        'created': [],
        'updating': [],
        'updated': [],
        'deleting': [],
        'deleted': [],
        'restoring': [],
        'restored': []
      };
      
      this.boot();
    }
  }
  
  public static registerEvent(event: string, callback: Function): void {
    this.bootIfNotBooted();
    
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
  }
  
  public static creating(callback: Function): void {
    this.registerEvent('creating', callback);
  }
  
  public static created(callback: Function): void {
    this.registerEvent('created', callback);
  }
  
  public static updating(callback: Function): void {
    this.registerEvent('updating', callback);
  }
  
  public static updated(callback: Function): void {
    this.registerEvent('updated', callback);
  }
  
  public static saving(callback: Function): void {
    this.registerEvent('saving', callback);
  }
  
  public static saved(callback: Function): void {
    this.registerEvent('saved', callback);
  }
  
  public static deleting(callback: Function): void {
    this.registerEvent('deleting', callback);
  }
  
  public static deleted(callback: Function): void {
    this.registerEvent('deleted', callback);
  }
  
  public static restoring(callback: Function): void {
    this.registerEvent('restoring', callback);
  }
  
  public static restored(callback: Function): void {
    this.registerEvent('restored', callback);
  }
  
  protected fireEvent(event: string): boolean {
    const modelClass = this.constructor as typeof Entity;
    modelClass.bootIfNotBooted();
    
    if (!modelClass.events[event]) {
      return true;
    }
    
    for (const callback of modelClass.events[event]) {      
      if (callback(this) === false) {
        return false;
      }
    }
    
    return true;
  }

  protected attributes: Record<string, any> = {};
  protected original: Record<string, any> = {};
  protected relations: Record<string, any> = {};
  protected exists: boolean = false;
  protected validator: Validator = new Validator();

  constructor(attributes: Record<string, any> = {}) {
    (this.constructor as typeof Entity).bootIfNotBooted();
    this.fill(attributes);
  }

  protected fill(attributes: Record<string, any>): this {
    for (const key in attributes) {
      if (this.isFillable(key)) {
        this.setAttribute(key, attributes[key]);
      }
    }
    return this;
  }

  protected isFillable(key: string): boolean {
    const fillable = (this.constructor as typeof Entity).fillable;
    return fillable.length === 0 || fillable.includes(key);
  }

  public setAttribute(key: string, value: any): this {
    this.attributes[key] = this.castAttribute(key, value);
    return this;
  }

  public getAttribute(key: string): any {
    if (this.attributes[key] === undefined) {
      return null;
    }

    return this.attributes[key];
  }

  public getAttributes(): Record<string, any> {
    return this.attributes;
  }

  public toJson(): Record<string, any> {
    const attributes = { ...this.attributes };
    const hidden = (this.constructor as typeof Entity).hidden;
    
    for (const key of hidden) {
      delete attributes[key];
    }
    
    const appends = (this.constructor as typeof Entity).appends;
    for (const key of appends) {
      const methodName = `get${
        key.charAt(0).toUpperCase() + key.slice(1)
      }Attribute`;
      if (typeof (this as any)[methodName] === "function") {
        attributes[key] = (this as any)[methodName]();
      }
    }
    
    for (const key in this.relations) {
      if (Array.isArray(this.relations[key])) {
        attributes[key] = this.relations[key].map((model: Entity) =>
          model.toJson()
        );
      } else if (this.relations[key] instanceof Entity) {
        attributes[key] = this.relations[key].toJson();
      } else {
        attributes[key] = this.relations[key];
      }
    }

    return attributes;
  }

  private castAttribute(key: string, value: any): any {
    const casts = (this.constructor as typeof Entity).casts;
    if (!casts[key]) return value;

    switch (casts[key]) {
      case "int":
      case "integer":
        return parseInt(value, 10);
      case "float":
      case "double":
        return parseFloat(value);
      case "string":
        return String(value);
      case "boolean":
      case "bool":
        return Boolean(value);
      case "object":
        return typeof value === "string" ? JSON.parse(value) : value;
      case "array":
        return typeof value === "string"
          ? JSON.parse(value)
          : Array.isArray(value)
          ? value
          : [value];
      case "date":
        return new Date(value);
      default:
        return value;
    }
  }
  
  protected static async getConnection(): Promise<Connection> {
    return Database.getConnection(this.connection);
  }

  public static async query(): Promise<QueryBuilder> {
    this.bootIfNotBooted();
    const connection = await this.getConnection(); // Obtenha a conexão
    return new QueryBuilder(connection).table(this.getTable());
  }

  public static async all(): Promise<Entity[]> {
    this.bootIfNotBooted();
    const results = await this.query(); // Aguarde a consulta
    return results.get().then((data) => this.hydrate(data)); // Aguarde o resultado
  }

  public static async find(id: any): Promise<Entity | null> {
    this.bootIfNotBooted();
    const results = await this.query(); // Aguarde a consulta
    return results.where(this.getPrimaryKey(), "=", id).first().then((result) => (result ? new this(result) : null)); // Aguarde o resultado
  }

  public static async findOrFail(id: any): Promise<Entity> {
    this.bootIfNotBooted();
    return this.find(id).then((model) => {
      if (!model) {
        throw new Error(`Model with ID ${id} not found`);
      }
      return model;
    });
  }

  public static where(
    field: string,
    operator: string,
    value: any
  ): Promise<QueryBuilder> {
    this.bootIfNotBooted();
    return this.query().then(query => query.where(field, operator, value)); // Aguarde a consulta
  }

  public static async create(attributes: Record<string, any>): Promise<Entity> {
    this.bootIfNotBooted();
    const model = new this(attributes);
    await model.save(); // Aguarde o save
    return model;
  }

  protected static hydrate(results: any[]): Entity[] {
    return results.map((result) => {
      const model = new this(result);
      model.exists = true;
      model.original = { ...model.attributes };
      return model;
    });
  }
  
  public async save(): Promise<boolean> {
    const isNew = !this.exists;
    
    if (!this.fireEvent('saving')) {
      return false;
    }
    
    if (isNew) {
      if (!this.fireEvent('creating')) {
        return false;
      }
    } else {
      if (!this.fireEvent('updating')) {
        return false;
      }
    }
    
    const timestamps = (this.constructor as typeof Entity).timestamps;
    if (timestamps) {
      const now = new Date();
      if (!this.exists) {
        this.setAttribute("created_at", now);
      }
      this.setAttribute("updated_at", now);
    }

    let result: boolean;
    if (this.exists) {
      result = await this.update();
    } else {
      result = await this.insert();
    }
    
    if (result) {
      this.fireEvent('saved');
      
      if (isNew) {
        this.fireEvent('created');
      } else {
        this.fireEvent('updated');
      }
    }
    
    return result;
  }

  protected async insert(): Promise<boolean> {
    const query = await (this.constructor as typeof Entity).query(); // Aguarde a consulta
    const result = await query.insert(this.attributes);    
    if (result && result.insertId) {
      this.setAttribute(
        (this.constructor as typeof Entity).getPrimaryKey(),
        result.insertId
      );
    }

    this.exists = true;
    this.original = { ...this.attributes };

    return true;
  }

  protected async update(): Promise<boolean> {
    const primaryKey = (this.constructor as typeof Entity).getPrimaryKey();
    const id = this.getAttribute(primaryKey);

    if (id === null) {
      throw new Error("Cannot update a entity without a primary key");
    }

    const dirty = this.getDirty();
    if (Object.keys(dirty).length === 0) {
      return true;
    }

    const query = await (this.constructor as typeof Entity).query(); // Aguarde a consulta
    await query.where(primaryKey, "=", id).update(dirty);

    this.original = { ...this.attributes };

    return true;
  }

  public async delete(): Promise<boolean> {
    if (!this.fireEvent('deleting')) {
      return false;
    }
    
    const softDeletes = (this.constructor as typeof Entity).softDeletes;
    const primaryKey = (this.constructor as typeof Entity).getPrimaryKey();
    const id = this.getAttribute(primaryKey);

    if (id === null) {
      throw new Error("Cannot delete a model without a primary key");
    }

    let success = false;
    if (softDeletes) {
      this.setAttribute("deleted_at", new Date());
      success = await this.update();
    } else {
      const query = await (this.constructor as typeof Entity).query(); // Aguarde a consulta
      await query.where(primaryKey, "=", id).delete();
      this.exists = false;
      success = true;
    }
    
    if (success) {
      this.fireEvent('deleted');
    }
    
    return success;
  }
  
  public async restore(): Promise<boolean> {
    if (!(this.constructor as typeof Entity).softDeletes) {
      throw new Error("Model does not use soft deletes");
    }
    
    if (!this.fireEvent('restoring')) {
      return false;
    }
    
    this.setAttribute("deleted_at", null);
    const result = await this.update();
    
    if (result) {
      this.fireEvent('restored');
    }
    
    return result;
  }

  public getDirty(): Record<string, any> {
    const dirty: Record<string, any> = {};

    for (const key in this.attributes) {
      if (this.original[key] !== this.attributes[key]) {
        dirty[key] = this.attributes[key];
      }
    }

    return dirty;
  }

  public static async with(...relations: string[]): Promise<QueryBuilder> {
    this.bootIfNotBooted();
    const query = await this.query(); // Aguarde a consulta
    (query as any).eagerLoad = relations;
    return query;
  }
  
  public hasOne(
    related: typeof Entity,
    foreignKey?: string,
    localKey?: string
  ): any {
    const instance = new related();
    localKey = localKey || (this.constructor as typeof Entity).getPrimaryKey();
    foreignKey = foreignKey || `${this.getModelName().toLowerCase()}_id`;

    return {
      getResults: async () => {
        const value = this.getAttribute(localKey!);
        const relatedQuery = await related.query(); // Aguarde a consulta
        return relatedQuery.where(foreignKey!, "=", value).first(); // Aguarde o resultado
      },
    };
  }

  public hasMany(
    related: typeof Entity,
    foreignKey?: string,
    localKey?: string
  ): any {
    const instance = new related();
    localKey = localKey || (this.constructor as typeof Entity).getPrimaryKey();
    foreignKey = foreignKey || `${this.getModelName().toLowerCase()}_id`;

    return {
      getResults: async () => {
        const value = this.getAttribute(localKey!);
        const relatedQuery = await related.query(); // Aguarde a consulta
        return relatedQuery.where(foreignKey!, "=", value).get(); // Aguarde o resultado
      },
    };
  }

  public belongsTo(
    related: typeof Entity,
    foreignKey?: string,
    ownerKey?: string
  ): any {
    const instance = new related();
    ownerKey = ownerKey || (related as typeof Entity).getPrimaryKey();
    foreignKey = foreignKey || `${instance.getModelName().toLowerCase()}_id`;

    return {
      getResults: async () => {
        const value = this.getAttribute(foreignKey!);
        const relatedQuery = await related.query(); // Aguarde a consulta
        return relatedQuery.where(ownerKey!, "=", value).first(); // Aguarde o resultado
      },
    };
  }

  public belongsToMany(
    related: typeof Entity,
    table?: string,
    foreignPivotKey?: string,
    relatedPivotKey?: string
  ): BelongsToMany {
    return new BelongsToMany(
      this,
      new related(),
      table,
      foreignPivotKey,
      relatedPivotKey
    );
  }
  
  protected static getTable(): string {
    return this.table || this.name.toLowerCase() + "s";
  }

  protected static getPrimaryKey(): string {
    return this.primaryKey;
  }

  protected getModelName(): string {
    return this.constructor.name;
  }

  public static getTableName(): string {
    return this.getTable();
  }

  public static getPrimaryKeyName(): string {
    return this.getPrimaryKey();
  }

  public getModelNameString(): string {
    return this.getModelName();
  }
}