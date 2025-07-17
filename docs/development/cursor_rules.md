# Cursor Rules

This document provides an overview of the Cursor rules used in the project for AI-assisted development. These rules help maintain consistency and provide quick guidance while coding.

## Available Rules

### 1. Project Overview

Location: `.cursor/rules/01-project-overview.mdc`

Provides a high-level overview of:

- Main entry points
- Core directories
- Configuration files
- Project structure

### 2. Database Schema

Location: `.cursor/rules/02-database-schema.mdc`

Documents:

- Database models and relationships
- Schema structure
- Database operations
- Connection handling

### 3. Development Workflow

Location: `.cursor/rules/03-development-workflow.mdc`

Covers:

- Getting started steps
- Available scripts
- Development process
- Build and deployment

### 4. Testing Guide

Location: `.cursor/rules/04-testing-guide.mdc`

Details:

- Test types and locations
- Testing utilities
- E2E testing
- Mocking approach

### 5. Schema Migrations

Location: `.cursor/rules/05-schema-migrations.mdc`

Explains:

- Migration workflow
- Naming conventions
- Best practices
- Troubleshooting

### 6. Testing Guide

Location: `.cursor/rules/06-testing-guide.mdc`

Details:

- Test types and locations
- Testing utilities
- E2E testing
- Element selection best practices

### 7. Coding Standards

Location: `.cursor/rules/08-coding-standards.mdc`

Covers:

- TypeScript conventions (prefer types over interfaces)
- Dutch language capitalization rules
- Implementation guidelines
- Enforcement practices

- All test files should be placed in a **tests** subfolder within their respective component or feature directory. Example: app/components/buttons/**tests**/DeleteButton.test.tsx

## Using Cursor Rules

1. **During Development**
   - Rules are automatically available to AI when using Cursor
   - They provide contextual help and guidance
   - Reference them for consistent practices

2. **Maintaining Rules**
   - Rules should be updated when related code changes
   - Keep rules concise and focused
   - Link to this documentation for detailed information

3. **Rule Updates**
   When making significant changes:
   - Update relevant rule files
   - Update this documentation
   - Keep both in sync

## Related Documentation

- [Development Guide](development.md) - Detailed development practices
- [Testing](../testing.md) - Comprehensive testing documentation
- [Troubleshooting](../troubleshooting.md) - Common issues and solutions
