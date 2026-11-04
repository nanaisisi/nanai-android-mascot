# Comprehensive Frontend TypeScript Migration Plan

Comprehensive migration of the remaining frontend codebase (`ui/js/**/*.js`) to TypeScript (`.ts`) following a domain-by-domain incremental strategy, ensuring 100% test pass rates and successful typechecks at every step.

## User Review Required

> [!IMPORTANT]
> This plan covers all remaining frontend subdirectories (`surface`, `ghost`, `ui`, `renderers`, `templates`, `touch`). Each milestone will be converted, tested with `vitest`, and verified with `npm run typecheck`.

## Open Questions

- None.

## Proposed Changes (Milestones)

### Milestone 1: Surface, Animation & Compositor Subsystem
- Migrate files in `ui/js/surface/` (compositor, framebuffers, collision, shell manifest, animation playback, character surface loading).

### Milestone 2: Ghost Control, Sakura Script Parser & Shiori Engine
- Migrate files in `ui/js/ghost/` (ghost controllers, shiori communication, command handlers, sakura script tokens and parsers).

### Milestone 3: UI Modals, Inputs & Renderers
- Migrate files in `ui/js/ui/`, `ui/renderers/`, and `ui/templates/` (menus, context menus, advanced inputs, markdown/ghost/system templates).

### Milestone 4: Touch & Android Bridge
- Migrate files in `ui/js/touch/` (android bridge, back button, overlay).

### Milestone 5: Final Verification & Typecheck
- Execute full typecheck (`npm run typecheck`), run all frontend unit tests (`npx vitest run`), and verify Vite build.

## Verification Plan

### Automated Tests
- Run `npm run typecheck` (`tsc --noEmit`)
- Run `npx vitest run` (All test suites)
- Run `npm run build` (Vite build)
