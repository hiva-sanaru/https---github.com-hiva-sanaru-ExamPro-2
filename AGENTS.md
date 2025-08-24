# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages, layout, global styles.
- `src/components`: Reusable UI and feature components (`ui`, `admin`, `auth`, `exam`).
- `src/ai`: Genkit setup and flows (`genkit.ts`, `dev.ts`, `flows/*`).
- `src/lib`: Types, data helpers, utilities.
- `src/hooks`: React hooks.
- `src/services`: API service wrappers and data fetching logic.
- `docs`: Project documentation and design blueprints (e.g., `docs/blueprint.md`).
- `tests/ui`: Playwright specs and snapshots.
- `.github/workflows/ui-tests.yml`: CI for UI tests.

## Build, Test, and Development Commands
- `npm run dev`: Start Next.js (Turbopack) on `http://localhost:9002`.
- `npm run genkit:dev`: Launch Genkit dev runner.
- `npm run genkit:watch`: Genkit dev runner in watch mode.
- `npm run lint`: Run ESLint (warnings do not fail builds).
- `npm run typecheck`: TypeScript type checking.
- `npm run build` → `npm start`: Production build and serve.
- `npm run test:ui`: Run Playwright UI tests (starts app on port 3000 via config).
- `VRT=1 npm run test:ui` / `npm run test:ui:update`: Enable/update visual snapshots.

## Coding Style & Naming Conventions
- Language: TypeScript + React. Indent 2 spaces.
- Files: kebab-case (`admin-layout.tsx`, `login-form.tsx`).
- Components: export PascalCase React components; colocate styles with components.
- Hooks: `src/hooks/*` named `use-*.ts(x)` and return typed values.
- Linting: `next lint`; Types: `tsc --noEmit`. Prefer `zod` schemas for runtime validation in AI flows.

## Testing Guidelines
- Framework: Playwright (`@playwright/test`). Tests live under `tests/ui` and end with `.spec.ts`.
- Snapshots: Visual regression gated by `VRT=1`. Update intentionally with `test:ui:update`.
- Local run: Ensure `npm run start:test` isn’t already running; the Playwright config auto-builds.

## Commit & Pull Request Guidelines
- Commits: Short, imperative subject; include scope when helpful (`admin:`, `exam:`, `ui:`, `ai:`). English or Japanese acceptable.
- PRs: Provide summary, linked issue, and testing notes. For UI changes, attach before/after screenshots and note any snapshot updates.
- CI: Ensure `npm run typecheck`, `npm run lint`, and `npm run test:ui` pass locally before requesting review.

## Security & Configuration Tips
- Keep secrets out of code. Use `.env.local` (Next.js) and `.env` for Genkit dev runner.
- Firebase project and hosting configuration is defined in `.firebaserc` and `apphosting.yaml`; do not commit service account keys or other sensitive credentials.
- Configure required API keys for Google AI and other third-party services via environment variables; document new variables in PRs that introduce them.
