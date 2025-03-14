import { Connection } from "../Connection";
import { Database } from "../Database";
import { QueryBuilder } from "../QueryBuilder";
import { Validator } from "../Validator";
import { BelongsToMany } from "./BelongsToMany";

/**
 * The Entity class serves as a base model for all database entities.
 * It provides methods for CRUD operations, event handling, and relationship management.
 */
export class Entity {
  // The name of the database table associated with the entity.
  protected static table: string;
  
  // The primary key field of the entity.
  protected static primaryKey: string = "id";
  
  // The database connection name, if applicable.
  protected static connection: string | null = null;
  
  // Indicates whether timestamps should be automatically managed.
  protected static timestamps: boolean = true;
  
  // Indicates whether soft deletes are enabled for the entity.
  protected static softDeletes: boolean = false;
  
  // An array of fillable attributes for mass assignment.
  protected static fillable: string[] = [];
  
  // An array of attributes that should be hidden when converting to JSON.
  protected static hidden: string[] = [];
  
  // A mapping of attributes to their data types for casting.
  protected static casts: Record<string, string> = {};
  
  // An array of attributes that should be appended to the model's array form.
  protected static appends: string[] = [];
  
  // Tracks whether the model has been booted.
  private static booted: Record<string, boolean> = {};
  
  // Stores event listeners for various model events.
  protected static events: Record<string, Function[]> = {};
  
  /**
   * Boot method for initializing the model.
   * Can be overridden in subclasses for custom initialization.
   */
  protected static boot(): void {
    // Default initialization here
  }
  
  /**
   * Ensures the model is booted before performing any operations.
   */
  protected static bootIfNotBooted(): void {
    const modelName = this.name;
    
    if (!this.booted[modelName]) {
      this.booted[modelName] = true;
      
      // Initialize event listeners for the model.
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
  
  /**
   * Registers an event listener for a specific model event.
   * @param event - The name of the event.
   * @param callback - The callback function to be executed when the event is fired.
   */
  public static registerEvent(event: string, callback: Function): void {
    this.bootIfNotBooted();
    
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
  }
  
  // Event registration methods for various model events.
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
  
  /**
   * Fires the specified event and executes all registered callbacks.
   * @param event - The name of the event to fire.
   * @returns A boolean indicating whether the event was successfully fired.
   */
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

  // Attributes, original values, and relations for the entity instance.
  protected attributes: Record<string, any> = {};
  protected original: Record<string, any> = {};
  protected relations: Record<string, any> = {};
  protected exists: boolean = false; // Indicates if the entity exists in the database.
  protected validator: Validator = new Validator(); // Validator instance for attribute validation.

  /**
   * Constructor for the Entity class.
   * @param attributes - Initial attributes to populate the entity.
   */
  constructor(attributes: Record<string, any> = {}) {
    (this.constructor as typeof Entity).bootIfNotBooted();
    this.fill(attributes);
  }

  /**
   * Fills the entity with the provided attributes.
   * @param attributes - The attributes to fill the entity with.
   * @returns The current instance of the entity.
   */
  protected fill(attributes: Record<string, any>): this {
    for (const key in attributes) {
      if (this.isFillable(key)) {
        this.setAttribute(key, attributes[key]);
      }
    }
    return this;
  }

  /**
   * Checks if a given attribute is fillable.
   * @param key - The attribute key to check.
   * @returns A boolean indicating if the attribute is fillable.
   */
  protected isFillable(key: string): boolean {
    const fillable = (this.constructor as typeof Entity).fillable;
    return fillable.length === 0 || fillable.includes(key);
  }

  /**
   * Sets an attribute on the entity, applying any necessary casting.
   * @param key - The attribute key.
   * @param value - The value to set for the attribute.
   * @returns The current instance of the entity.
   */
  public setAttribute(key: string, value: any): this {
    this.attributes[key] = this.castAttribute(key, value);
    return this;
  }

  /**
   * Retrieves the value of a specified attribute.
   * @param key - The attribute key.
   * @returns The value of the attribute, or null if not set.
   */
  public getAttribute(key: string): any {
    if (this.attributes[key] === undefined) {
      return null;
    }

    return this.attributes[key];
  }

  /**
   * Retrieves all attributes of the entity.
   * @returns An object containing all attributes.
   */
  public getAttributes(): Record<string, any> {
    return this.attributes;
  }

  /**
   * Converts the entity to a JSON representation, excluding hidden attributes.
   * @returns An object representing the entity in JSON format.
   */
  public toJson(): Record<string, any> {
    const attributes = { ...this.attributes };
    const hidden = (this.constructor as typeof Entity).hidden;
    
    // Remove hidden attributes from the JSON representation.
    for (const key of hidden) {
      delete attributes[key];
    }
    
    // Append additional attributes if defined.
    const appends = (this.constructor as typeof Entity).appends;
    for (const key of appends) {
      const methodName = `get${
        key.charAt(0).toUpperCase() + key.slice(1)
      }Attribute`;
      if (typeof (this as any)[methodName] === "function") {
        attributes[key] = (this as any)[methodName]();
      }
    }
    
    // Include related models in the JSON representation.
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

  /**
   * Casts an attribute value to its defined type.
   * @param key - The attribute key.
   * @param value - The value to cast.
   * @returns The casted value.
   */
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
  
  /**
   * Retrieves the database connection for the entity.
   * @returns A promise that resolves to a Connection instance.
   */
  protected static async getConnection(): Promise<Connection> {
    return Database.getConnection(this.connection);
  }

  /**
   * Creates a new QueryBuilder instance for the entity's table.
   * @returns A promise that resolves to a QueryBuilder instance.
   */
  public static async query(): Promise<QueryBuilder> {
    this.bootIfNotBooted();
    const connection = await this.getConnection(); // Obtain the connection
    return new QueryBuilder(connection).table(this.getTable());
  }

  /**
   * Retrieves all records from the entity's table.
   * @returns A promise that resolves to an array of Entity instances.
   */
  public static async all(): Promise<Entity[]> {
    this.bootIfNotBooted();
    const results = await this.query(); // Await the query
    return results.get().then((data) => this.hydrate(data)); // Await the result
  }

  /**
   * Finds a record by its primary key.
   * @param id - The primary key value.
   * @returns A promise that resolves to the found Entity instance or null.
   */
  public static async find(id: any): Promise<Entity | null> {
    this.bootIfNotBooted();
    const results = await this.query(); // Await the query
    return results.where(this.getPrimaryKey(), "=", id).first().then((result) => (result ? new this(result) : null)); // Await the result
  }

  /**
   * Finds a record by its primary key or throws an error if not found.
   * @param id - The primary key value.
   * @returns A promise that resolves to the found Entity instance.
   * @throws Error if the record is not found.
   */
  public static async findOrFail(id: any): Promise<Entity> {
    this.bootIfNotBooted();
    return this.find(id).then((model) => {
      if (!model) {
        throw new Error(`Model with ID ${id} not found`);
      }
      return model;
    });
  }

  /**
   * Builds a query with a where clause.
   * @param field - The field to filter by.
   * @param operator - The comparison operator.
   * @param value - The value to compare against.
   * @returns A promise that resolves to a QueryBuilder instance.
   */
  public static where(
    field: string,
    operator: string,
    value: any
  ): Promise<QueryBuilder> {
    this.bootIfNotBooted();
    return this.query().then(query => query.where(field, operator, value)); // Await the query
  }

  /**
   * Creates a new record in the database with the provided attributes.
   * @param attributes - The attributes for the new record.
   * @returns A promise that resolves to the created Entity instance.
   */
  public static async create(attributes: Record<string, any>): Promise<Entity> {
    this.bootIfNotBooted();
    const model = new this(attributes);
    await model.save(); // Await the save operation
    return model;
  }

  /**
   * Hydrates an array of raw results into Entity instances.
   * @param results - The raw results from the database.
   * @returns An array of hydrated Entity instances.
   */
  protected static hydrate(results: any[]): Entity[] {
    return results.map((result) => {
      const model = new this(result);
      model.exists = true; // Mark the model as existing
      model.original = { ...model.attributes }; // Store original attributes
      return model;
    });
  }
  
  /**
   * Saves the entity to the database, either inserting or updating.
   * @returns A promise that resolves to a boolean indicating success.
   */
  public async save(): Promise<boolean> {
    const isNew = !this.exists; // Determine if the entity is new
    
    if (!this.fireEvent('saving')) {
      return false; // Abort if the saving event fails
    }
    
    if (isNew) {
      if (!this.fireEvent('creating')) {
        return false; // Abort if the creating event fails
      }
    } else {
      if (!this.fireEvent('updating')) {
        return false; // Abort if the updating event fails
      }
    }
    
    // Handle timestamps if enabled
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
      result = await this.update(); // Update existing record
    } else {
      result = await this.insert(); // Insert new record
    }
    
    if (result) {
      this.fireEvent('saved'); // Fire saved event
      
      if (isNew) {
        this.fireEvent('created'); // Fire created event if new
      } else {
        this.fireEvent('updated'); // Fire updated event if existing
      }
    }
    
    return result;
  }

  /**
   * Inserts a new record into the database.
   * @returns A promise that resolves to a boolean indicating success.
   */
  protected async insert(): Promise<boolean> {
    const query = await (this.constructor as typeof Entity).query(); // Await the query
    const result = await query.insert(this.attributes); // Insert the attributes
    
    if (result && result.insertId) {
      this.setAttribute(
        (this.constructor as typeof Entity).getPrimaryKey(),
        result.insertId // Set the primary key with the inserted ID
      );
    }

    this.exists = true; // Mark the entity as existing
    this.original = { ...this.attributes }; // Store original attributes

    return true;
  }

  /**
   * Updates the existing record in the database.
   * @returns A promise that resolves to a boolean indicating success.
   */
  protected async update(): Promise<boolean> {
    const primaryKey = (this.constructor as typeof Entity).getPrimaryKey();
    const id = this.getAttribute(primaryKey);

    if (id === null) {
      throw new Error("Cannot update an entity without a primary key");
    }

    const dirty = this.getDirty(); // Get attributes that have changed
    if (Object.keys(dirty).length === 0) {
      return true; // No changes to update
    }

    const query = await (this.constructor as typeof Entity).query(); // Await the query
    await query.where(primaryKey, "=", id).update(dirty); // Update the dirty attributes

    this.original = { ...this.attributes }; // Store original attributes

    return true;
  }

  /**
   * Deletes the entity from the database.
   * @returns A promise that resolves to a boolean indicating success.
   */
  public async delete(): Promise<boolean> {
    if (!this.fireEvent('deleting')) {
      return false; // Abort if the deleting event fails
    }
    
    const softDeletes = (this.constructor as typeof Entity).softDeletes;
    const primaryKey = (this.constructor as typeof Entity).getPrimaryKey();
    const id = this.getAttribute(primaryKey);

    if (id === null) {
      throw new Error("Cannot delete a model without a primary key");
    }

    let success = false;
    if (softDeletes) {
      this.setAttribute("deleted_at", new Date()); // Set the deleted_at timestamp for soft deletes
      success = await this.update(); // Update the record
    } else {
      const query = await (this.constructor as typeof Entity).query(); // Await the query
      await query.where(primaryKey, "=", id).delete(); // Permanently delete the record
      this.exists = false; // Mark the entity as not existing
      success = true;
    }
    
    if (success) {
      this.fireEvent('deleted'); // Fire deleted event
    }
    
    return success;
  }
  
  /**
   * Restores a soft-deleted entity.
   * @returns A promise that resolves to a boolean indicating success.
   * @throws Error if the model does not support soft deletes.
   */
  public async restore(): Promise<boolean> {
    if (!(this.constructor as typeof Entity).softDeletes) {
      throw new Error("Model does not use soft deletes");
    }
    
    if (!this.fireEvent('restoring')) {
      return false; // Abort if the restoring event fails
    }
    
    this.setAttribute("deleted_at", null); // Clear the deleted_at timestamp
    const result = await this.update(); // Update the record
    
    if (result) {
      this.fireEvent('restored'); // Fire restored event
    }
    
    return result;
  }

  /**
   * Retrieves the attributes that have been modified since the entity was loaded.
   * @returns An object containing the dirty attributes.
   */
  public getDirty(): Record<string, any> {
    const dirty: Record<string, any> = {};

    for (const key in this.attributes) {
      if (this.original[key] !== this.attributes[key]) {
        dirty[key] = this.attributes[key]; // Track modified attributes
      }
    }

    return dirty;
  }

  /**
   * Prepares a query to eager load relationships.
   * @param relations - The names of the relationships to load.
   * @returns A promise that resolves to a QueryBuilder instance.
   */
  public static async with(...relations: string[]): Promise<QueryBuilder> {
    this.bootIfNotBooted();
    const query = await this.query(); // Await the query
    (query as any).eagerLoad = relations; // Set eager load relations
    return query;
  }
  
  /**
   * Defines a one-to-one relationship.
   * @param related - The related model class.
   * @param foreignKey - The foreign key on the related model.
   * @param localKey - The local key on the current model.
   * @returns An object representing the relationship.
   */
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
        const relatedQuery = await related.query(); // Await the query
        return relatedQuery.where(foreignKey!, "=", value).first(); // Await the result
      },
    };
  }

  /**
   * Defines a one-to-many relationship.
   * @param related - The related model class.
   * @param foreignKey - The foreign key on the related model.
   * @param localKey - The local key on the current model.
   * @returns An object representing the relationship.
   */
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
        const relatedQuery = await related.query(); // Await the query
        return relatedQuery.where(foreignKey!, "=", value).get(); // Await the result
      },
    };
  }

  /**
   * Defines a many-to-one relationship.
   * @param related - The related model class.
   * @param foreignKey - The foreign key on the current model.
   * @param ownerKey - The primary key on the related model.
   * @returns An object representing the relationship.
   */
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
        const value = this.getAttribute(foreignKey! );
        const relatedQuery = await related.query(); // Await the query
        return relatedQuery.where(ownerKey!, "=", value).first(); // Await the result
      },
    };
  }

  /**
   * Defines a many-to-many relationship.
   * @param related - The related model class.
   * @param table - The pivot table name.
   * @param foreignPivotKey - The foreign key on the pivot table for the current model.
   * @param relatedPivotKey - The foreign key on the pivot table for the related model.
   * @returns A BelongsToMany instance representing the relationship.
   */
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
  
  /**
   * Retrieves the table name associated with the entity.
   * @returns The table name as a string.
   */
  protected static getTable(): string {
    return this.table || this.name.toLowerCase() + "s";
  }

  /**
   * Retrieves the primary key name for the entity.
   * @returns The primary key name as a string.
   */
  protected static getPrimaryKey(): string {
    return this.primaryKey;
  }

  /**
   * Retrieves the model name for the entity.
   * @returns The model name as a string.
   */
  protected getModelName(): string {
    return this.constructor.name;
  }

  /**
   * Static method to get the table name.
   * @returns The table name as a string.
   */
  public static getTableName(): string {
    return this.getTable();
  }

  /**
   * Static method to get the primary key name.
   * @returns The primary key name as a string.
   */
  public static getPrimaryKeyName(): string {
    return this.getPrimaryKey();
  }

  /**
   * Retrieves the model name as a string.
   * @returns The model name as a string.
   */
  public getModelNameString(): string {
    return this.getModelName();
  }
}