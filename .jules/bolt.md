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

## 2026-11-15 - [Slot-09 Cycle 10: Multi-Character Surface Aliases & Regression-Free Auditing]

**Learning:** In UKADOC/SSP specifications, ghosts with more than two characters can define character-scoped surface aliases via `char<N>.surface.alias` (e.g. `char2.surface.alias`). Supporting these required: 1) extending `SurfacesTxt` with `char_aliases: BTreeMap<u32, BTreeMap<String, Vec<u32>>>` and deep-merging them in Rust, 2) implementing stable Rust prefix parsing for `char<N>.surface.alias` and `char<N>.surface[N]` without relying on unstable `let_chains`, and 3) implementing multi-scope alias lookup and fallback in TypeScript (`surface-collision.ts`). Additionally, parsing the `makoto` attribute in `GhostManifest` eliminated audit regressions in `verify_spec_compliance.py` without mutating any documentation files, preserving zero Git merge conflict risk across 15 parallel slots.
**Action:** Always maintain strict stable Rust compatibility for parser helper branches, handle multi-scope hierarchies (`char<N>` -> `kero`/`char1` -> `sakura`/`char0` -> fallback), and resolve audit regressions in production code rather than editing spec markdown files during concurrent slot execution.
