# Virtual/Internal Window Manager Architecture Implementation Plan

Transitioning from Tauri native multi-window spawning (`subchar_window_*`, `balloon_window`) to an in-app DOM-based **Virtual/Internal Window Manager** running inside `index.html`. This ensures uniform, robust, and glitch-free character and balloon rendering across Android, desktop Tauri, and browser preview.

## User Review Required

> [!IMPORTANT]
> This is a major architectural refactoring that moves window management from OS-level native webviews to an in-app DOM window compositor. It eliminates platform-specific window transparency and IPC synchronization bugs on Android and desktop.

## Open Questions

- Should we retain Tauri window command stubs for backward compatibility in tests? (Yes, keeping graceful fallbacks for Tauri commands ensures existing tests pass without modification.)

## Proposed Changes

### Core UI & Window Management

#### [NEW] [internal-window-manager.ts](ui/ts/core/internal-window-manager.ts)

- Implement `InternalWindowManager` class handling virtual floating window creation, dragging, z-index focus stacking, scaling, and positioning.

#### [MODIFY] [index.html](ui/index.html)

- Update main container layout to host dynamic virtual windows for characters and balloons.

#### [MODIFY] [ghost-surface.ts](ui/ts/surface/ghost-surface.ts)

- Update `updateSurface` to render into virtual internal window panels instead of invoking native Tauri window commands.

## Verification Plan

### Automated Tests

- Run `npm run test` to ensure all existing frontend and core unit tests pass.
- Add unit tests for `InternalWindowManager`.

### Manual Verification

- Test dragging, Z-index focusing, and rendering of characters and balloons on Android/Tauri runtime.
