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
