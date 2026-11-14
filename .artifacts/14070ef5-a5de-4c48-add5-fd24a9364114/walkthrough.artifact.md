# Walkthrough - TypeScript-to-WASM Migration & Bug Fixes

Here is a summary of the work accomplished during the TypeScript-to-WASM migration and quality enhancements.

## Changes

### 1. Protocol Validation & WASM Expansion
- **[NEW/MODIFY]**: Added `wasm_is_no_update_path` to `crates/nanai-core/src/update_protocol.rs` for high-performance `noupdate` path filtering in Rust/WASM.
- **[MODIFY]**: Updated TypeScript WASM protocol bindings (`ui/ts/core/wasm/wasm-protocol.ts` and `wasm-bridge.ts`) to expose `isNoUpdatePath`.

### 2. Rust Code Quality & `unsafe` Hygiene
- Refactored all C-ABI `extern "C"` functions across `nanai-core` to `pub unsafe extern "C"` with explicit `# Safety` documentation comments, completely eliminating `#[allow(clippy::not_unsafe_ptr_arg_deref)]`.
- Refactored complex closure types in `crates/ui/src/shiori/engine/loader/resolution.rs` to eliminate `#[allow(clippy::type_complexity)]`.

### 3. Balloon, Menu, and Submenu Bug Fixes
- Fixed negative `validrect` offset parsing and container padding/window sizing to prevent outer edge clipping.
- Restored left alignment, sharp right angles (`border-radius: 0`), and hover image (`foreground_bitmap`) support in context menus and submenus.
- Fixed window `blur` event handling so that active submenus do not prematurely close the menu.
- Added robust process cleanup (`shutdown_application` unloading engines and killing `shiori-host32.exe` via taskkill) to prevent lingering background processes on app exit.

## Verification Results

### Automated Tests
- **`cargo test -p nanai-core`**: 33 unit tests passed successfully.
- **`cargo clippy --workspace`**: Passed with zero warnings and zero errors.
- **`npm test` (Vitest)**: All 268 test files and 1,076 tests passed successfully.
