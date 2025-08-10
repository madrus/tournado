# Tournado Documentation

Welcome to the Tournado documentation! This guide will help you understand and work with the Tournado application.

## Quick Navigation

- [Getting Started](getting-started.md) - Set up your development environment
- [Development](development/overview.md) - Development guidelines and practices
- [Database Schema Changes](development/database-schema-changes.md) - Schema modifications and migrations
- [Cursor Rules](development/cursor-rules.md) - AI-assisted development with Cursor
- [Testing](testing/overview.md) - Testing practices and guidelines
- [Deployment](deployment/overview.md) - Deployment procedures and environments

## 🚀 Featured: Vitest MCP Server

This project features a **production-ready MCP server** for AI-assisted testing:

- **NPM Package**: `@madrus/vitest-mcp-server` - Available globally
- **Status**: v1.0.5 - All tools working reliably
- **Integration**: Seamless Cursor & Claude Desktop support
- **Coverage**: 584 tests across 24 test suites with comprehensive coverage analysis
- **Environment**: Requires `SESSION_SECRET` for authentication module compatibility

[Learn more about the Vitest MCP Server →](testing/vitest-mcp.md)

## About Tournado

Tournado is a tournament management application built with:

- [React Router v7](https://reactrouter.com/) - Full stack web framework
- [Prisma](https://prisma.io) - Database ORM with enum types
- [TypeScript](https://typescriptlang.org) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

### Key Features

- **Authentication**: All users redirect to admin panel after successful login
- **Tournament Management**: Admin-only feature with dedicated menu navigation
- **Team Management**: Comprehensive team creation and management
- **Role-Based Access**: Different UI experiences for admin vs regular users
- **Mobile Optimized**: Swipe-to-delete functionality and responsive design

## Project Structure

The application follows the React Router v7 project structure with some additional organization:

- `app/` - Application source code
- `prisma/` - Database schema and migrations
- `playwright/` - End-to-end tests
- `docs/` - Project documentation

## Contributing

See our [Development Guide](development/overview.md) for contribution guidelines and best practices.
