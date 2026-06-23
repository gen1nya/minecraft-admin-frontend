# Repository Guidelines

## Project Structure & Module Organization

This is an npm workspace with two packages under `packages/`. The React/Vite frontend lives in `packages/client`, with source in `packages/client/src`, reusable UI in `components/`, hooks in `hooks/`, API types and calls in `api/`, shared context in `context/`, and styled-components theme utilities in `styles/`. The Express/WebSocket backend lives in `packages/server`, with TypeScript source in `packages/server/src` and compiled output in `packages/server/dist`. Deployment files are at the repository root, including `docker-compose.yml` and package Dockerfiles.

## Build, Test, and Development Commands

- `npm install`: install root and workspace dependencies.
- `npm run dev`: run server and client together via `concurrently`.
- `npm run dev:client`: start the Vite frontend only.
- `npm run dev:server`: start the backend with `tsx watch`.
- `npm run build`: type-check and build all workspaces.
- `npm run lint`: runs workspace lint scripts if any are present.
- `npm run preview --workspace=@mcp/client`: preview the built frontend.
- `npm run start --workspace=@mcp/server`: run the compiled backend from `dist`.

## Coding Style & Naming Conventions

Use TypeScript throughout. Keep strict compiler settings passing; the client also rejects unused locals and parameters. Follow the existing style: two-space indentation, single quotes, semicolons, React function components, and styled-components for UI styling. Use PascalCase for React components and modal files, camelCase for hooks, functions, and variables, and prefix hooks with `use`. Prefer the client alias `@/` for imports from `packages/client/src`.

## Testing Guidelines

No automated test framework is currently configured. For changes, run `npm run build` as the minimum verification. When adding tests, colocate them near the code they cover with names like `ComponentName.test.tsx` or `module.test.ts`, and add workspace scripts so `npm test --workspaces` can run them consistently.

## Commit & Pull Request Guidelines

Recent history uses short, imperative commit subjects such as `Fix chat messages not clearing when switching servers` and `Add broadcast button to Server Status`. Keep commits focused and describe the user-visible behavior or bug fixed. Pull requests should include a concise summary, verification steps, linked issues when relevant, and screenshots or screen recordings for UI changes.

## Security & Configuration Tips

Do not commit secrets or runtime server lists. `.env`, local env variants, `servers.json`, and `packages/server/servers.json` are ignored because they may contain RCON credentials. Use environment variables such as `RCON_HOST`, `RCON_PORT`, and `RCON_PASSWORD` for local or Docker configuration.
