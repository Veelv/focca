![Focca logo](https://raw.githubusercontent.com/Veelv/focca/master/focca.png?width=200)

[![NPM Version](https://img.shields.io/npm/v/focca)](https://www.npmjs.com/package/focca)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/Veelv/focca/blob/main/LICENSE.md)
[![Version](https://img.shields.io/github/v/release/Veelv/focca)](https://github.com/Veelv/focca/blob/main/RELEASE.md)


Focca is a versatile library designed for database management, migrations, and seeding. It supports multiple database systems, including MySQL, MongoDB, SQLite, PostgreSQL, and SQL Server. This README provides instructions on how to use the Focca library effectively.

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Commands](#commands)
- [Creating Migrations](#creating-migrations)
- [Running Migrations](#running-migrations)
- [Creating Seeders](#creating-seeders)
- [Running Seeders](#running-seeders)
- [Versioning](#versioning)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the Focca library, you can use npm or yarn:

```bash
npm install focca
```

or

```bash
yarn add focca
```

## Configuration

Before using the library, you need to configure your database connections. Create a configuration file named `focca.config.json` in the root of your project. The structure of the configuration file should look like this:

```json
{
  "default": "mysql",
  "connections": {
    "mysql": {
      "driver": "mysql",
      "host": "localhost",
      "port": 3306,
      "username": "your_username",
      "password": "your_password",
      "database": "your_database"
    },
    "mongodb": {
      "driver": "mongodb",
      "url": "mongodb://localhost:27017/your_database"
    },
    "sqlite": {
      "driver": "sqlite",
      "database": "path/to/your/database.sqlite"
    },
    "postgres": {
      "driver": "postgres",
      "host": "localhost",
      "port": 5432,
      "username": "your_username",
      "password": "your_password",
      "database": "your_database"
    },
    "sqlserver": {
      "driver": "sqlserver",
      "host": "localhost",
      "port": 1433,
      "username": "your_username",
      "password": "your_password",
      "database": "your_database"
    }
  }
}
```

## Commands

Focca provides a command-line interface (CLI) to manage migrations, seeders, and configurations. Here are the available commands:

- `info`: Displays application information.
- `create:migration <name>`: Creates a new migration file.
- `create:entity <name>`: Creates a new model file.
- `create:seeder <name> <table>`: Creates a new seeder file for a specified table.
- `migrate`: Executes all pending migrations.
- `rollback`: Reverts the last migration.
- `refresh`: Rolls back all migrations and reapplies them.
- `fresh`: Resets the database and applies all migrations from scratch.
- `config:database <types>`: Configures one or more databases.
- `config:refresh <types>`: Updates the database configuration.
- `config:remove <types>`: Removes specified databases from the configuration.
- `run:seeder <name> <table>`: Runs the specified seeder for the given table.
- `list`: Lists all available commands.

## Creating Migrations

To create a new migration, use the following command:

```bash
focca create:migration <migration_name>
```

This will generate a new migration file in the `src/migrations/database` directory.

## Running Migrations

To execute all pending migrations, run:

```bash
focca migrate
```

This command will apply all migrations that have not yet been executed.

## Creating Seeders

To create a new seeder, use the following command:

```bash
focca create:seeder <seeder_name>
```

This will generate a new seeder file in the `src/migrations/seeder` directory.

## Running Seeders

To run a specific seeder, use the following command:

```bash
focca run:seeder <seeder_name>
```

This command will run the specified seeder.

## Versioning

You can check the application version and description by running:

```bash
focca info
```

## Contributing

Contributions are welcome! If you have suggestions or improvements, feel free to submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE.md](https://github.com/Veelv/focca/blob/main/LICENSE.md) file for details.