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

## [1.0.2] - 2025-03-11
### Bug Fixes and Improvements

- **Enhanced Performance:** Adjustment in recognition in the database.
- **Command System Bug Fixes:** Resolved several issues affecting CLI command reliability and execution flow.
- **Prettier Integration:** Added support for Prettier code formatting to maintain consistent code style throughout the project.
- **Bug Fixes in Migration System:** Fixed issues affecting migration execution in complex database environments.
- **Improved Error Handling:** Enhanced error reporting with more descriptive messages and troubleshooting suggestions.

## [1.0.3] - 2025-03-20

### Improvements and New Features
- **Enhanced Database Communication:** Improved the communication process with the database for more reliable table migrations.
- **Template File Recognition:** Enhanced the recognition of template files for executing commands, ensuring smoother operations.
- **Blueprint Improvements:** Improved the Blueprint system for defining non-nullable columns, providing better validation and error handling.
- **UUID Generator Enhancements:** Adjusted the UUID generator to facilitate easier password creation using bcrypt and Argon2 through the Hash class.
- **Seeder Improvements:** Enhanced the seeder functionality for better data population and management.

### Developer Experience

- **Simplified Configuration Process:** Streamlined configuration for better developer experience.
- **Documentation Updates:** Expanded CLI command documentation with additional examples.

## Support and Maintenance

To report bugs or request new features, please open an issue in the project's GitHub repository.