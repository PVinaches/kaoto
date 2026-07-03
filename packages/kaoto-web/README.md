# CFM UI

A client-side React application using Carbon Design System, built with Vite and TypeScript.

## Overview

This is the user interface module for the CFM (Cloud Foundation Management) project. It's a streamlined, client-side only application based on the Carbon React Router starter template.

## Tech Stack

- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Vite 7** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Carbon Design System** - IBM's open-source design system
- **Yarn** - Package manager

## Project Structure

```
cfm-ui/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── commonHeader/  # Common header component
│   │   ├── footer/        # Footer component
│   │   ├── nav/           # Navigation components
│   │   └── profilePanel/  # User profile panel
│   ├── layouts/           # Page layout components
│   ├── pages/             # Page components
│   │   ├── dashboard/     # Dashboard page with tiles and visualizations
│   │   ├── not-found/     # 404 page
│   │   └── placeholder/   # Placeholder page for example routes
│   ├── routes/            # Routing configuration
│   │   ├── config.ts      # Route definitions
│   │   └── index.tsx      # Router component
│   ├── test/              # Test utilities and setup
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions (theme, cookies)
│   ├── entry-client.tsx   # Application entry point
│   └── index.scss         # Global styles
├── public/                # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install
```

### Development

```bash
# Start development server
yarn dev

# The app will be available at http://localhost:5173
```

### Build

```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build locally
- `yarn type-check` - Run TypeScript type checking
- `yarn lint` - Run all linters (ESLint, Stylelint, Prettier)
- `yarn lint-fix` - Fix linting issues automatically
- `yarn test` - Run tests with coverage
- `yarn test:watch` - Run tests in watch mode

## Routes

The application includes the following routes:

- `/` - Dashboard (home page)
- `/dashboard` - Dashboard page
- `/dashboard/:id` - Dashboard with URL parameters
- `/page-1` - Example page 1
- `/page-2` - Example page 2

## Features

- **Carbon Design System** - Consistent UI with IBM's design system
- **Theme Support** - Light/dark theme switching
- **Responsive Layout** - Works on desktop and mobile devices
- **TypeScript** - Full type safety throughout the application
- **Fast Development** - Hot module replacement with Vite
- **Code Quality** - ESLint, Prettier, and Stylelint configured

## Customization

### Adding New Routes

Edit `src/routes/config.ts` to add new routes:

```typescript
{
  path: '/your-route',
  element: YourComponent,
  carbon: {
    label: 'Your Label',
    inHeader: true, // Show in header navigation
  },
}
```

### Adding New Pages

1. Create a new folder in `src/pages/`
2. Add your component and styles
3. Import and add to routes configuration

### Styling

- Global styles: `src/index.scss`
- Component styles: Co-located with components (e.g., `component-name.scss`)
- Uses SCSS with Carbon Design System tokens

## Testing

The project uses Vitest with Testing Library for unit tests:

```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch
```

## License

Apache-2.0

## Attribution

Based on the [Carbon React Router Starter](https://github.com/carbon-design-system/carbon-react-router-starter) template.
