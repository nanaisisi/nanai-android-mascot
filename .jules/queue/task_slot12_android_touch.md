# Task: Slot-12 Android Gesture and Touch Binding

**Status**: TODO
**Domain**: Domain 4 (UI/バルーン演出 & モバイルUX)
**Ownership**: `ui/js/ui/touch/`, `ui/js/surface/interaction.js` (Do not edit outside!)
**Context**:
Implement unique spec from `docs/doc/nas-spec/platform/android-overlay-and-service-spec/` regarding gesture mapping (Swipe/LongPress -> SHIORI events).

**Goal**:
1. Implement a 600ms long-press detector in `interaction.js` to dispatch `OnMouseDoubleClick`.
2. Implement swipe gesture detection (distinguishing from drag).
3. Ensure pointer-events are passed through for transparent areas.