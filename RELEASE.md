# Release Notes - Focca Library

This document contains the release history of the Focca library, including new features, bug fixes, and improvements for each version.

## [1.0.0] - 2025-03-01

### Initial Release

- Support for multiple database systems: MySQL, MongoDB, SQLite, PostgreSQL and SQL Server
- Database migration system
- Seeding system for data population
- Complete CLI with commands for managing migrations and seeders
- Flexible configuration via `focca.config.json` file

### Main features

- Creating and executing migrations
- Creating and executing seeders
- Rolling and refreshing commands for migrations
- Creating entities/models
- Managing database configurations

## [1.0.1] - 2025-03-01

### Bug Fixes and Improvements

- **Removed persistence of configuration for unnecessary commands**: Adjusted configuration management to avoid unnecessary persistence in specific commands.
- **Bug fixes in the database system**: Resolved issues affecting communication with some database systems.
- **Improved message visualization**: Updated logs and error messages to make them clearer and more informative.

## Suporte e Manutenção

To report bugs or request new features, please open an issue in the project's GitHub repository.