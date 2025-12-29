# Chaney

**Chart your money**

Project every account, simulate new projects, and stay audit-ready with clean dashboards powered by React, TanStack Query, and Recharts.

## Overview

Chaney is a financial forecasting application that helps you visualize and project account balances over time. It supports multiple accounts, recurring transactions, one-off expenses, and custom date ranges to provide comprehensive financial projections.

## Tech Stack

### Core Framework

- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Vite 6** - Build tool and dev server

### Data & State Management

- **TanStack Query 5** - Server state management and data fetching
- **TanStack Query DevTools** - Development debugging tools

### UI & Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **Recharts 3** - Charting library for financial visualizations
- **clsx** - Conditional class names

### Internationalization

- **i18next** - Internationalization framework
- **react-i18next** - React bindings for i18next
- **i18next-browser-languagedetector** - Language detection
- **i18next-scanner** - Automatic translation key extraction

### Utilities

- **date-fns 4** - Date manipulation and formatting
- **zod 4** - Schema validation

### Development Tools

- **Vitest 4** - Unit testing framework
- **Testing Library** - React component testing utilities
- **ESLint 9** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **Storybook** - Component development environment

## Features

- **Multi-account forecasting**: Project balances across multiple accounts simultaneously
- **Recurring transactions**: Support for weekly, monthly, and yearly recurring income/expenses
- **One-off transactions**: Handle single-date transactions
- **Custom date ranges**: Select forecast periods (3, 6, 12, or 24 months)
- **Interactive charts**: Visualize account balance projections with Recharts
- **Transaction filtering**: View transactions grouped by account and schedule type
- **Account selection**: Toggle accounts in/out of forecasts
- **Threshold lines**: Visual thresholds on charts for goal tracking
- **Internationalization**: English and French language support
- **Tax calculations**: Support for tax rates on income transactions
- **Transaction interruptions**: Handle date ranges where recurring transactions pause

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone git@github.com:StevenGnt/chaney.git
cd chaney
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Finance Data Configuration

To use your personal finance data instead of the example data:

1. Copy the example file: `cp public/finance-data.example.json public/finance-data.json`
2. Edit `public/finance-data.json` with your own accounts, transactions, and thresholds

The app automatically uses your personal file if it exists (falling back to the example otherwise). Your personal data is git-ignored and never committed.

## Available Scripts

### Development

- `npm run dev` - Start the Vite development server
- `npm run preview` - Preview the production build locally

### Building

- `npm run build` - Build the application for production
- `npm run typecheck` - Run TypeScript type checking without emitting files

### Code Quality

- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Check code formatting with Prettier
- `npm run format:write` - Format code with Prettier

### Testing

- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run coverage` - Generate test coverage report

### Internationalization

- `npm run i18n:extract` - Extract translation keys from source files

### Storybook

- `npm run storybook` - Start Storybook development server
- `npm run storybook:build` - Build Storybook for production

## Project Structure

```
src/
├── app/                    # Application root component
├── assets/                 # Static assets
├── components/             # Shared UI components
├── features/               # Feature-based modules
│   └── ForecastWorkspace/  # Main forecasting feature
├── lib/                    # Shared libraries and utilities
├── mocks/                  # Mock data and services
├── providers/              # React context providers
└── test/                   # Test setup files

public/
└── locales/                # Translation files
```

## Testing

The project uses **Vitest** as the testing framework with **Testing Library** for React component testing.

### Test Setup

- Test configuration is in `vite.config.ts`
- Test setup file: `src/test/setup.ts`
- Tests use `jsdom` environment for browser simulation

### Running Tests

```bash
npm run test          # Run tests once
npm run test:watch    # Run tests in watch mode
npm run coverage      # Generate coverage report
```

### Current Test Coverage

- Financial projection logic (`src/lib/finance/projection.test.ts`)

## Internationalization

The application supports multiple languages using i18next. Currently supported languages:

- English (en)
- French (fr)

### Translation Files

Translation files are located in `public/locales/{lang}/common.json`.

### Extracting Translation Keys

Run the i18next scanner to automatically extract translation keys from source files:

```bash
npm run i18n:extract
```

## Code Quality

### ESLint

The project uses ESLint with strict TypeScript rules:

- Type-aware linting enabled
- React Hooks rules
- Import ordering and organization
- Custom rules for code style

### Prettier

Code formatting is handled by Prettier with Tailwind CSS plugin for class sorting.

### Git Hooks

Husky is configured to run lint-staged on pre-commit:

- ESLint checks on staged TypeScript/JavaScript files
- Prettier formatting on staged files
- Zero warnings policy enforced

## TODO

### High Priority

- [ ] **Expand Test Coverage**
  - Add tests for React components
  - Add tests for custom hooks
  - Add tests for utility functions
  - Add integration tests for the forecast workflow

- [ ] **Set Up CI/CD Pipeline**
  - Create GitHub Actions workflow for automated testing
  - Add linting and type checking to CI pipeline
  - Set up automated builds and deployments
  - Add test coverage reporting to CI

- [ ] **Initialize Storybook**
  - Create Storybook configuration files
  - Add stories for shared components
  - Add stories for feature components

### Medium Priority

- [ ] **Accessibility**
  - Ensure proper ARIA labels
  - Test with screen readers

### Low Priority

- [ ] **Additional Features**
  - Show for a given day the list of transactions impacting the balance
  - Improve transactions list for recurring operations
  - CRUD operations on accounts and transactions within the UI
  - Simulation of new projects and financial scenarios
