# Team Workspace

A [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) single-page application.

This is the foundation scaffold for the workspace. Routing, CSS Modules, and the
design system are added by subsequent stories in the Foundation epic.

## Requirements

- Node.js >= 20 LTS (see [`.nvmrc`](./.nvmrc); run `nvm use` if you use nvm)
- npm

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at the URL Vite prints (default http://localhost:5173) with
hot module replacement.

## Scripts

| Command           | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR.                               |
| `npm run build`   | Type-check (`tsc --noEmit`) and build a production bundle to `dist/`. |
| `npm run preview` | Serve the built `dist/` bundle locally.                           |
| `npm run lint`    | Lint the codebase with ESLint.                                    |

## Path aliases

TypeScript strict mode is enabled and the following import aliases are available
(defined once in [`tsconfig.json`](./tsconfig.json) and shared with Vite via
`vite-tsconfig-paths`):

| Alias          | Resolves to        |
| -------------- | ------------------ |
| `@components/` | `src/components/`  |
| `@pages/`      | `src/pages/`       |
| `@styles/`     | `src/styles/`      |
| `@hooks/`      | `src/hooks/`       |
| `@utils/`      | `src/utils/`       |

## Environment variables

Copy [`.env.example`](./.env.example) to `.env` and populate values as features
are added. Vite only exposes variables prefixed with `VITE_`.
