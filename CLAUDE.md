# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A4C-FrontEnd is a frontend application project currently in its initial setup phase. The project has been initialized as a git repository but does not yet have a framework or build system configured.

## Project Status

**Current State**: Empty project awaiting framework initialization
- Git repository initialized on main branch
- No frontend framework selected yet
- No build tools or dependencies configured
- No source code structure established

## Next Steps for Development

When setting up this project, you'll need to:

1. **Choose and initialize a frontend framework**:
   - React: `npx create-react-app .` or `npm create vite@latest . -- --template react`
   - Vue: `npm create vue@latest .`
   - Angular: `ng new . --directory .`
   - Next.js: `npx create-next-app@latest .`

2. **After framework initialization**, common commands will typically include:
   - `npm install` or `yarn install` - Install dependencies
   - `npm run dev` or `npm start` - Start development server
   - `npm run build` - Build for production
   - `npm run test` - Run tests
   - `npm run lint` - Run linting

## Project Naming Convention

The project name "A4C-FrontEnd" suggests this is the frontend component of a larger "A4C" application or system. Consider maintaining consistency with this naming convention throughout the codebase.

## Development Guidelines

Since this is a fresh project, ensure to:
- Follow the chosen framework's best practices and conventions
- Set up proper TypeScript configuration if using TypeScript
- Configure ESLint and Prettier for code consistency
- Establish a clear component structure
- Set up testing framework appropriate to the chosen technology

## Notes

- The project currently has no commits, so the first commit will establish the initial project structure
- Remember to update the README.md with project-specific information once the framework is chosen