# Task: Slot-08 SERIKO Advanced Animation

**Status**: TODO
**Domain**: Domain 3 (サーフィス合成 & アニメーション描画)
**Ownership**: `crates/ui/src/animation/`, `ui/js/surface/surface-animation-manager.js` (Do not edit outside!)
**Context**:
We need to support multiple simultaneous SERIKO animations (e.g., blinking and talking simultaneously) based on `docs/doc/nas-spec/ghost/surfaces-and-collision-spec/`.

**Goal**:
1. Modify `SurfaceAnimationManager` in JS to handle arrays of animation intervals (e.g., `sometimes`, `talk`).
2. Hook up the `talk` animation trigger to fire when Sakura Script types characters.
3. Write unit tests for `surface-animation-manager.js`.