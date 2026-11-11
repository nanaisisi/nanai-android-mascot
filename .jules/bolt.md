## 2023-11-09 - [Performance Optimization]

**Learning:** `processChromaKey` is a hot path for image processing. Using `Uint32Array` instead of standard RGBA loop improves processing speed significantly in JS Canvas element. It handles big vs little endian correctly to not break tests. In addition, Promise.all can be used for drawing non-interfering layers in `composeSurfaceElements`.
**Action:** Always prefer `Uint32Array` when processing image data channel iteration in HTML5 Canvas Context. Use concurrent fetches when appropriate.

## 2024-05-23 - [Canvas Image Processing Optimization]

**Learning:** In `ui/js/surface/compositor/chromakey.js`, the PNA alpha mask application loop originally iterated over an 8-bit `Uint8ClampedArray` processing 4 channels per pixel individually. We can significantly improve the performance of this hot path by interpreting the underlying array buffer as a 32-bit `Uint32Array`. However, when doing so, it is crucial to handle byte endianness properly (little-endian vs big-endian) to correctly identify and manipulate the Alpha or Red channels.
**Action:** When manually applying per-pixel manipulation on HTML5 Canvas ImageData, cast the buffer to a `Uint32Array` for faster memory access and manipulation, but always implement an endianness check to ensure correct bitwise operations across different hardware architectures.

## 2024-05-23 - [Canvas Promise.all Optimization for Surface Render]

**Learning:** `composeSurfaceElements` and `composeFrameOnBase` originally iterated through each layer in a sequence, loaded the layer image from the cache via `drawLayer()`, and synchronously awaited the load before processing the next layer. We can improve performance by separating image loading and image drawing, and pre-fetching all layer images concurrently using `Promise.all`. This significantly reduces the blocking time in multi-layer composites, while still drawing images sequentially to preserve proper z-order blending.
**Action:** When a method needs to draw multiple layers in HTML5 Canvas context from URLs, separate the `Image` load from `CanvasRenderingContext2D` manipulation. Always use `Promise.all` to fetch all `Image` objects concurrently, then loop sequentially to draw them to preserve operations that depend on z-order.

## 2026-11-02 - [Fast Case-Insensitive Surface Alias Resolution]

**Learning:** In `ui/js/surface/surface-collision.js`, `resolveSurfaceNumber` fell back to an O(N) `for...in` scan on case-mismatched or missing aliases. By caching a lazily built case-folded `Map` in a module-scoped `WeakMap` keyed by the alias object, lookups become O(1) without memory leaks. Case-mismatched lookup latency dropped from ~1360 ms to ~26.6 ms per 100k calls (a ~50x speedup), and misses dropped from ~1371 ms to ~19.2 ms (a ~71x speedup).
**Action:** When performing case-insensitive lookups against immutable or long-lived plain dictionary objects, use `WeakMap<object, Map<string, V>>` to cache lowercased keys lazily, converting repeated O(N) traversals into O(1) lookups while guaranteeing automatic garbage collection.
## 2026-11-03 - Cache parsed interval string

**Learning:** Found a hotspot during interval triggers where every tick evaluates and parses the animation interval string dynamically. This was inefficient as the object and set is constantly created.
**Action:** Caching the parsed outcome string as a property directly onto the animation object prevents unnecessary repetitive re-evaluation.

## 2026-11-08 - UKADOC SHIORI Event Protocol & Parallel Merge Safety

**Learning:** During parallel multi-agent development cycles, running non-dry-run specification compliance audits that modify hundreds of individual `docs/spec/**/*.md` audit files will cause massive Git merge conflicts across branches. However, updating the central `docs/spec/SUMMARY.md` directly via `verify_spec_compliance` preserves accurate project-wide metric tracking (jumping from 69.83% to 76.76%, +143 verified items) cleanly and safely.
**Action:** When expanding specification definitions, rely on central protocol registries (like `SHIORI_EVENTS`) and typed notification methods, test against them, and keep audit file changes localized to avoid merge collisions across parallel slots.
## 2026-11-08 - [Compositor Advanced Blend Modes and Transparent Region Black]

**Learning:** When applying `seriko.paint_transparent_region_black`, checking corner pixel chroma key match on non-zero alpha pixels requires endian-aware bit manipulation on `Uint32Array` in HTML5 Canvas context. Clamping RGB channels to zero while preserving the alpha channel directly in 32-bit integer arithmetic avoids expensive unpacking and repacking.
**Action:** When performing color replacement or masked coloring on Canvas buffers with alpha preserved, update the 32-bit pixel with `(alpha << 24) >>> 0` (or `alpha` for big-endian), ensuring immediate single-instruction writes.
## 2026-11-07 - [Slot-08 Cycle 8: SERIKO Scaling DrawMethod & Surface Change Events]

**Learning:** During continuous animation stepping, SERIKO `scaling` modifies the character window scale multipliers (scaleX, scaleY). Coupling scaling changes with `_baseScalingOffsets` and notifying `FrameStepEvent` preserves frame rate stability while avoiding unnecessary DOM style recalculations when scale remains constant. Furthermore, gating lip-sync triggered by `onCharSpoken` behind an O(1) scope-indexed boolean map (`isSerikoTalkEnabled`) completely eliminates useless animation scheduling when `\![set,serikotalk,false]` is active.
**Action:** Always maintain per-scope toggle maps for SERIKO talking and scaling offsets, and fire SHIORI notification hooks (`OnSurfaceChange`, `OnOtherSurfaceChange`) asynchronously without blocking the render pipeline.
## 2026-11-08 - [UKADOC Compliance Audit Engine Conflict Prevention & Scoped Sync]

**Learning:** Running batch spec updates across all audit READMEs causes substantial git churn and increases merge conflict risk in a 15-slot parallel engineering workflow. Isolating `--target` matching and implementing idempotent `--sync-readmes` (only modifying files when content differs) keeps the codebase clean and safe.
**Action:** When updating compliance tables or tooling, default to safe dry-run/read-only behavior, scope operations with exact category filters, and verify that 0 unexpected files are touched.
## 2026-11-13 - [Fast Case-Insensitive Tooltip and Cursor Lookups]

**Learning:** In `ui/ts/surface/surface-collision.ts`, `getTooltipForCollision` and `getCursorForCollision` used O(N) linear array and object traversals per collision check. By caching a lazily built case-folded `Map` in a module-scoped `WeakMap` keyed by the tooltip or cursor configuration objects (matching the pattern previously used for surface aliases), lookups were converted to O(1) operations, significantly optimizing the collision resolution hot path.
**Action:** Always prefer `WeakMap<object, Map<string, V>>` for fast case-insensitive lookups on immutable configuration objects to turn repeated O(N) scans into O(1) lookups without causing memory leaks.

## 2026-11-14 - [Slot-01 Cycle 9: SSTP Bidirectional Parsing & FMO Zero-Conflict Protocol]

**Learning:** In high-concurrency parallel slot development (15 parallel tracks), touching markdown files in `docs/spec/` causes widespread merge conflicts across feature branches. Focusing solely on runtime robustness (e.g. `SstpResponse::parse` bidirectional roundtripping, Content-Length extraction, FMO record builders, and fluent record lookup) achieves specification conformance and extreme resilience without touching conflicting documentation files.
**Action:** During iterative cycle expansions, confine code changes to owned subdirectories (`crates/ui/src/sstp`, `crates/ui/src/fmo`, `ui/ts/core/actions/sstp-fmo-actions.ts`) and document achievements in architecture logs and test suites.
## 2026-11-14 - [Slot-13 Cycle 9: Spec Audit Conflict Prevention & Safe SUMMARY Sync]

**Learning:** During parallel execution across 15 development slots, batch-updating individual spec audit files (`docs/spec/**/*.md`) produces hundreds of file diffs that invariably collide with parallel branches. Introducing `--update-summary-only` runs the full audit engine in-memory (dry-run mode) and updates only the aggregate `docs/spec/SUMMARY.md` file, eliminating merge conflicts while keeping the project metric accurate (achieving 1634/2065 items, 79.13% compliance). Additionally, integrating `detect_git_conflicts` with `--check-conflicts` prevents committing or proceeding with unmerged conflict markers.
**Action:** When running audit scripts in multi-agent parallel workflows, always utilize `--update-summary-only` or `--dry-run` to keep documentation writes localized, and run `--check-conflicts` in CI/pre-commit hooks to ensure clean branches.
## 2026-11-14 - [Slot-04 Cycle 9: AST Traversal Predicates & Subtree Scope Isolation]

**Learning:** In SakuraScript AST structures, full tree traversals and intermediate vector allocations during routine token inspections (such as checking for wait commands or extracting animations) created unnecessary memory churn. Providing an allocation-free short-circuiting predicate walker (`has_command`) and isolated subtree filters (`filter_by_scope`, `strip_waits`) dramatically speeds up playback inspection pipelines and fast-forward log sanitization in both Rust and TypeScript.
**Action:** When implementing AST utility methods, provide predicate short-circuiting traversal functions to avoid full-tree traversal when only existence checks are needed, and isolate subtrees by scope for multi-character rendering.
## 2026-11-14 - [Slot-10 Cycle 9: Balloon Typography & Alignment Multi-Scope Robustness]

**Learning:** Balloon `descript.txt` properties in UKADOC/SSP often contain out-of-range color channels or comma-separated strings rather than individual `.r/.g/.b` keys, as well as character-specific scope prefixes like `char<ID>.balloon.*`. Extending `rgbFromComponents` with `[0, 255]` channel clamping and comma triplet parsing protects CSS variables from invalid syntax, while resolving `char<ID>.balloon.*` properties prior to generic `balloon.*` allows custom balloons for multi-character ghosts to correctly position overhead, bottom, or side alignments. Furthermore, guarding DOM/localStorage access in `BalloonThemeManager` prevents ReferenceErrors when executing tests or headless evaluation.
**Action:** When parsing styling or layout descriptors, always clamp numeric color channels, support both decomposed (`.r/.g/.b`) and comma-delimited RGB formats, resolve multi-scope hierarchies (`char<ID>` -> `sakura/kero` -> generic), and guard browser globals (`document`, `localStorage`).

## 2026-11-15 - [Slot-11 Cycle 10: Modal Dialog Option Parsing & Cleanup Resilience]

**Learning:** In UKADOC SSP input box specifications, `--option=` parameters may be supplied as compound flags delimited by commas, semicolons, or pipes (e.g. `--option=noclose,noclear`). Parsing these flags defensively and wrapping individual dialog cleanup routines in `try / catch` blocks ensures that a faulty or already removed DOM element does not halt the teardown of subsequent active modal dialogs, choices, or input boxes. Furthermore, parsing `makoto: Option<String>` in ghost descript manifests satisfies specification audit compliance without causing Git merge conflicts on audit markdown files.
**Action:** When handling composite command-line or script options, support flexible delimiters (comma, pipe, semicolon), protect cleanup hooks with defensive error boundaries, and avoid modifying shared spec files during high-concurrency parallel slot workflows.
## 2026-11-15 - [Slot-15 Cycle 10: Update Planning & Spec Audit Conflict Prevention]

**Learning:** Running non-dry-run audit scripts during parallel multi-slot development mutates hundreds of documentation files and causes merge conflicts across branches. Inspecting audit warnings via `--dry-run` and addressing the missing implementation (such as extracting `makoto` in `GhostManifest`) directly satisfies specification compliance checks without modifying a single markdown file in `docs/spec/`. Additionally, introducing `UpdatePlan` (partitioning entries into additions, modifications, deletions, and unchanged) and `UpdateProgressSummary` provides complete, deterministic network update state tracking in Rust.
**Action:** Always use `verify_spec_compliance.py --dry-run` to monitor compliance without touching audit files, and provide structured update planning and progress telemetry on data package models.
## 2026-11-15 - [Slot-09 Cycle 10: Multi-Character Surface Aliases & Regression-Free Auditing]

**Learning:** In UKADOC/SSP specifications, ghosts with more than two characters can define character-scoped surface aliases via `char<N>.surface.alias` (e.g. `char2.surface.alias`). Supporting these required: 1) extending `SurfacesTxt` with `char_aliases: BTreeMap<u32, BTreeMap<String, Vec<u32>>>` and deep-merging them in Rust, 2) implementing stable Rust prefix parsing for `char<N>.surface.alias` and `char<N>.surface[N]` without relying on unstable `let_chains`, and 3) implementing multi-scope alias lookup and fallback in TypeScript (`surface-collision.ts`). Additionally, parsing the `makoto` attribute in `GhostManifest` eliminated audit regressions in `verify_spec_compliance.py` without mutating any documentation files, preserving zero Git merge conflict risk across 15 parallel slots.
**Action:** Always maintain strict stable Rust compatibility for parser helper branches, handle multi-scope hierarchies (`char<N>` -> `kero`/`char1` -> `sakura`/`char0` -> fallback), and resolve audit regressions in production code rather than editing spec markdown files during concurrent slot execution.
## 2026-11-15 - [Slot-04 Cycle 10: SakuraScript AST Transformations & Spec Audit Regression Immunity]

**Learning:** In multi-cycle AST processing, mutating tokens in place or performing ad-hoc manual traversals leads to structural bugs and fragile recursive logic. Providing clean AST mapping primitives (`map_commands` in Rust and `mapAstCommands` in TypeScript) preserves AST immutability and node container invariants (Scope, Anchor, Choice) while allowing simple token transformations (such as wait scaling or command rewriting). Additionally, centralizing plain-text extraction (`extract_text` / `extractAstText`) and tree diagnostics (`node_count`, `depth` / `getAstDiagnostics`) allows screen-readers, TTS engines, and speech logger components to consume dialog text without re-parsing raw SakuraScript. Finally, ensuring `GhostManifest` parses `makoto` prevents specification audit regressions (`makoto.md`) without needing to edit documentation files directly.
**Action:** Always provide functional mapping (`map_commands`) and non-destructive extractors on tree data structures, and keep spec audits clean (0 regressions) without touching docs files.

## 2026-11-16 - [Slot-01 & Jules EOL: Agent-Agnostic 15-Parallel Architecture & Spec Audit Zero-Conflict Policy]

**Learning:** With Jules concluding and multi-agent 15-parallel development transitioning to diverse AI engines (Android Studio Gemini 3.1 Pro Preview, Claude Code, Codex, Cursor, human devs), running `scripts/verify_spec_compliance.py` without safeguards would batch-overwrite thousands of spec markdown files and cause catastrophic Git merge conflicts across concurrent branches. The architecture mandates: 1) using `--dry-run` or `--check` during development and `--update-summary-only` on main/CI, 2) eliminating docs editing from feature branches and achieving compliance purely via production code implementations, and 3) advancing Slot-01 (SSTP & FMO) towards HTTP/WebSocket gateways, async SAORI streaming, and cross-platform IPC abstraction.
**Action:** Always maintain the zero-doc-mutation policy in parallel branches, verify clean state with `--check-conflicts`, and use the standardized prompt specification defined in `docs/doc/nas-spec/compatibility-implementation-plan/Jules終了後の15並列自律開発と仕様適合に関する改善提案書.md`.

## 2024-05-18 - [Memoization pattern for `.slice().sort()` array sorting]

**Learning:** Found a performance bottleneck where `.slice().sort()` is being re-executed on every animation frame for sorting animations, patterns, elements, and collision shapes inside `shell-manifest.ts` and `surface-collision.ts`. Because these inputs (manifest array definitions) are usually strictly read-only after being created by the Tauri Rust backend, slicing and sorting on every access wastes substantial memory/GC cycles and CPU time.
**Action:** Use `WeakMap<unknown[], unknown[]>` module-scoped caches where the original array is used as a weak key to map directly to the sorted array. Since `slice().sort()` guarantees that the items remain references to the underlying objects, caching the fully sorted array completely bypasses O(N log N) processing on the hot execution path.
