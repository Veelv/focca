import { ForeignKeyDefinition } from './ForeignKeyDefinition'

export class Blueprint {
  protected table: string
  protected columns: Array<{
    name: string
    type: string
    parameters: Record<string, any>
    modifiers: Array<{
      type: string
      value?: any
    }>
  }> = []
  protected indexes: Array<any> = []
  protected foreignKeys: Array<any> = []
  protected primaryKeyDefined: boolean = false

  constructor(table: string) {
    this.table = table
  }

  public id(column: string = 'id'): Blueprint {
    return this.bigIncrements(column)
  }

  public uuid(column: string = 'id'): Blueprint {
    return this.string(column, 36)
  }

  public bigIncrements(column: string): Blueprint {
    return this.unsignedBigInteger(column, true)
  }

  public unsignedBigInteger(
    column: string,
    autoIncrement: boolean = false,
  ): Blueprint {
    const result = this.addColumn('bigint', column)
    this.unsigned()

    if (autoIncrement) {
      this.addModifier('autoIncrement')
      this.primary()
    }

    return result
  }

  public bigInteger(column: string): Blueprint {
    return this.addColumn('bigint', column)
  }

  public binary(column: string): Blueprint {
    return this.addColumn('blob', column)
  }

  public boolean(column: string): Blueprint {
    return this.addColumn('boolean', column)
  }

  public char(column: string, length: number = 255): Blueprint {
    return this.addColumn('char', column, { length })
  }

  public date(column: string): Blueprint {
    return this.addColumn('date', column)
  }

  public dateTime(column: string): Blueprint {
    return this.addColumn('datetime', column)
  }

  public decimal(
    column: string,
    total: number = 8,
    places: number = 2,
  ): Blueprint {
    return this.addColumn('decimal', column, {
      total,
      places,
    })
  }

  public double(
    column: string,
    total: number | null = null,
    places: number | null = null,
  ): Blueprint {
    return this.addColumn('double', column, {
      total,
      places,
    })
  }

  public enum(column: string, allowed: string[]): Blueprint {
    return this.addColumn('enum', column, {
      allowed,
    })
  }

  public float(
    column: string,
    total: number = 8,
    places: number = 2,
  ): Blueprint {
    return this.addColumn('float', column, {
      total,
      places,
    })
  }

  public integer(column: string): Blueprint {
    return this.addColumn('integer', column)
  }

  public json(column: string): Blueprint {
    return this.addColumn('json', column)
  }

  public longText(column: string): Blueprint {
    return this.addColumn('longtext', column)
  }

  public mediumText(column: string): Blueprint {
    return this.addColumn('mediumtext', column)
  }

  public morphs(name: string): Blueprint {
    this.string(`${name}_type`)
    this.unsignedBigInteger(`${name}_id`)
    this.index([`${name}_type`, `${name}_id`])

    return this
  }

  public string(column: string, length: number = 255): Blueprint {
    return this.addColumn('VARCHAR', column, { length })
  }

  public text(column: string): Blueprint {
    return this.addColumn('text', column)
  }

  public time(column: string): Blueprint {
    return this.addColumn('time', column)
  }

  public timestamp(column: string): Blueprint {
    return this.addColumn('timestamp', column)
  }

  public timestamps(): Blueprint {
    this.timestamp('created_at').nullable()
    this.timestamp('updated_at').nullable()

    return this
  }

  public softDeletes(): Blueprint {
    return this.timestamp('deleted_at').nullable()
  }

  public nullable(): Blueprint {
    this.addModifier('nullable')
    return this
  }

  public notNullable(): Blueprint {
    this.addModifier('notNullable')
    return this
  }

  public default(value: any): Blueprint {
    this.addModifier('default', value)
    return this
  }

  public unsigned(): Blueprint {
    this.addModifier('unsigned')
    return this
  }

  public unique(): Blueprint {
    this.addModifier('unique')
    return this
  }

  public index(columns?: string[]): Blueprint {
    if (columns) {
      this.indexes.push({
        columns,
        type: 'index',
      })
    } else {
      this.addModifier('index')
    }
    return this
  }

  public primary(): Blueprint {
    if (!this.primaryKeyDefined) {
      this.addModifier('primary')
      this.primaryKeyDefined = true
    } else {
      console.warn(`Primary key already defined for table ${this.table}`)
    }
    return this
  }

  public foreign(columns: string | string[]): ForeignKeyDefinition {
    const foreignKeyDefinition = new ForeignKeyDefinition(this, columns)
    return foreignKeyDefinition
  }

  protected addColumn(
    type: string,
    name: string,
    parameters: Record<string, any> = {},
  ): Blueprint {
    this.columns.push({
      name,
      type,
      parameters,
      modifiers: [],
    })
    return this
  }

  protected addModifier(type: string, value: any = null): void {
    const lastColumn = this.columns[this.columns.length - 1]
    lastColumn.modifiers.push({
      type,
      value,
    })
  }

  public addForeignKey(foreignKey: any): void {
    this.foreignKeys.push(foreignKey)
  }

  public getTable(): string {
    return this.table
  }

  public getColumns(): Array<any> {
    return this.columns
  }

  public getIndexes(): Array<any> {
    return this.indexes
  }

  public getForeignKeys(): Array<any> {
    return this.foreignKeys
  }

  public toSql(driver: string = 'mysql'): string {
    const columnDefinitions: string[] = []
    const constraints: string[] = []

    for (const column of this.columns) {
      const def = this.buildColumnDefinition(column, driver)
      columnDefinitions.push(def)

      if (driver === 'pgsql') {
        constraints.push(...this.buildConstraints(column))
      }
    }

    // Adiciona as definições de chaves estrangeiras
    for (const foreignKey of this.foreignKeys) {
      constraints.push(this.buildForeignKeyDefinition(foreignKey, driver))
    }

    const sql = this.buildCreateTableStatement(
      this.table,
      [...columnDefinitions, ...constraints],
      driver,
    )

    return sql
  }

  protected buildForeignKeyDefinition(foreignKey: any, driver: string): string {
    const quotedTable = this.quoteIdentifier(this.table, driver)
    const quotedColumn = this.quoteIdentifier(foreignKey.column, driver)
    const quotedForeignTable = this.quoteIdentifier(foreignKey.on, driver)
    const quotedForeignColumn = this.quoteIdentifier(
      foreignKey.references,
      driver,
    )

    const constraintName =
      foreignKey.name ?? `${this.table}_${foreignKey.column}_foreign`
    const quotedConstraintName = this.quoteIdentifier(constraintName, driver)

    let sql = `ALTER TABLE ${quotedTable} ADD CONSTRAINT ${quotedConstraintName} `
    sql += `FOREIGN KEY (${quotedColumn}) REFERENCES ${quotedForeignTable} (${quotedForeignColumn})`

    if (foreignKey.onDelete) {
      sql += ` ON DELETE ${foreignKey.onDelete}`
    }

    if (foreignKey.onUpdate) {
      sql += ` ON UPDATE ${foreignKey.onUpdate}`
    }

    return sql
  }

  protected buildColumnDefinition(column: any, driver: string): string {
    let def = `\`${column.name}\` ${column.type}`

    if (column.type === 'VARCHAR' && column.parameters.length) {
      def += `(${column.parameters.length})`
    } else if (
      column.parameters.total !== undefined &&
      column.parameters.places !== undefined
    ) {
      def += `(${column.parameters.total},${column.parameters.places})`
    }

    for (const modifier of column.modifiers) {
      def += this.buildModifier(modifier, driver)
    }

    return def
  }

  protected mapColumnType(type: string, driver: string): string {
    const typeMap: { [key: string]: { [key: string]: string } } = {
      mysql: {
        string: 'VARCHAR',
        text: 'TEXT',
        integer: 'INT',
        bigint: 'BIGINT',
        boolean: 'tinyint',
        date: 'date',
        dateTime: 'datetime',
        decimal: 'decimal',
        double: 'double',
        float: 'float',
        json: 'json',
        longText: 'longtext',
        mediumText: 'mediumtext',
        time: 'time',
        timestamp: 'TIMESTAMP',
      },
      pgsql: {
        string: 'VARCHAR',
        text: 'text',
        integer: 'integer',
        bigInteger: 'bigint',
        boolean: 'boolean',
        date: 'date',
        dateTime: 'timestamp',
        decimal: 'decimal',
        double: 'double precision',
        float: 'real',
        json: 'jsonb',
        longText: 'text',
        mediumText: 'text',
        time: 'time',
        timestamp: 'timestamp',
      },
      sqlite: {
        string: 'VARCHAR',
        text: 'text',
        integer: 'integer',
        bigInteger: 'integer',
        boolean: 'integer',
        date: 'date',
        dateTime: 'datetime',
        decimal: 'real',
        double: 'real',
        float: 'real',
        json: 'text',
        longText: 'text',
        mediumText: 'text',
        time: 'time',
        timestamp: 'datetime',
      },
      sqlsrv: {
        string: 'VARCHAR',
        text: 'nvarchar(max)',
        integer: 'int',
        bigInteger: 'bigint',
        boolean: 'bit',
        date: 'date',
        dateTime: 'datetime2',
        decimal: 'decimal',
        double: 'float',
        float: 'real',
        json: 'nvarchar(max)',
        longText: 'nvarchar(max)',
        mediumText: 'nvarchar(max)',
        time: 'time',
        timestamp: 'datetime2',
      },
    }

    return typeMap[driver]?.[type] ?? type
  }

  protected quoteIdentifier(identifier: string, driver: string): string {
    switch (driver) {
      case 'mysql':
        return `\`${identifier}\``
      case 'pgsql':
        return `"${identifier}"`
      case 'sqlite':
        return `"${identifier}"`
      case 'sqlsrv':
        return `[${identifier}]`
      default:
        return identifier
    }
  }

  protected buildModifier(modifier: any, driver: string): string {
    let result = ''
    switch (modifier.type) {
      case 'nullable':
        result = ' NULL'
        break
      case 'notNullable':
        result = ' NOT NULL'
        break
      case 'default':
        result = ` DEFAULT ${modifier.value}`
        break
      case 'unsigned':
        result = ' UNSIGNED'
        break
      case 'unique':
        result = ' UNIQUE'
        break
      case 'index':
        result = ' INDEX'
        break
      case 'primary':
        result = ' PRIMARY KEY'
        break
      case 'autoIncrement':
        result = ' AUTO_INCREMENT'
        break
      default:
        console.log(`Unknown modifier: ${modifier.type}`)
        break
    }
    return result
  }

  protected buildConstraints(column: any): string[] {
    const constraints: string[] = []

    if (column.modifiers.some((m: any) => m.type === 'primary')) {
      constraints.push(
        `ALTER TABLE \`${this.table}\` ADD CONSTRAINT \`${this.table}_pkey\` PRIMARY KEY (\`${column.name}\`)`,
      )
    }

    if (column.modifiers.some((m: any) => m.type === 'unique')) {
      constraints.push(
        `ALTER TABLE \`${this.table}\` ADD CONSTRAINT \`${this.table}_${column.name}_key\` UNIQUE (\`${column.name}\`)`,
      )
    }

    if (column.modifiers.some((m: any) => m.type === 'index')) {
      constraints.push(
        `ALTER TABLE \`${this.table}\` ADD INDEX \`${this.table}_${column.name}_index\` (\`${column.name}\`)`,
      )
    }

    return constraints
  }

  protected buildCreateTableStatement(
    table: string,
    definitions: string[],
    driver: string,
  ): string {
    let sql = `CREATE TABLE \`${table}\` (`

    sql += definitions.join(', ')

    sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'

    if (driver === 'pgsql') {
      sql += ' TABLESPACE pg_default'
    }

    sql += ';'

    return sql
  }
}
