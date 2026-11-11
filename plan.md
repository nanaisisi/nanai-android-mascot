1. **Refactor activeBindAnimationIds Cache in SurfaceManager**:
   - The feedback identified that invalidating the cache purely inside `bindDressup` leads to a leaky abstraction and stale cache if `dressupState` is mutated outside the method.
   - We will implement an invalidation approach by tracking the reference or state of `dressupState`, or by proxying the `dressupState` mutation, OR simple module-level `WeakMap` strategy keyed off of the `dressupState` map instance AND size/values, but wait, `dressupState` is modified directly in tests (`manager.dressupState.set(...)`).
   - A better way: Instead of explicit deletion, cache the sorting logic within a module-level `WeakMap` or use an invalidation flag. However, since `dressupState` can be updated directly via `.set()`, we can just override `set` on `this.dressupState` during initialization, or we can use a simpler approach: `activeBindAnimationIds` can cache the result based on a "hash" or snapshot of `dressupState` values for that scope.
   - Actually, simpler approach: The cost is primarily `.flatMap(...).sort()`. If we iterate `bindGroupsForScope` and see if `dressupState` values have changed for this scope, we can return the cached value.
   - Or, we can replace `this.dressupState` with a proxy or custom Map subclass in `SurfaceManager`'s constructor that clears the cache on `set()`, `delete()`, or `clear()`.
   - Even simpler and safest: create a `Map` extension that hooks into `set`/`delete`/`clear` to increment a `version` counter. Then `activeBindAnimationIds` checks if the `version` has changed since the last computation.

2. **Implementation details**:
   - In `ui/ts/surface/surface-manager.ts`, add a `dressupStateVersion: number = 0;` to `SurfaceManager`.
   - Replace `this.dressupState = new Map();` with an overridden Map that increments `this.dressupStateVersion` on `set`, `delete`, and `clear`.
   - In `ui/ts/surface/surface-dressup.ts`, `activeBindAnimationIds` will store `{ version: number, ids: number[] }` inside `_activeBindAnimationIdsCache`. If `cache.version === self.dressupStateVersion`, it returns `cache.ids`.

3. **Code readability improvement**:
   - Remove the ugly `this as unknown as ...` typing blocks. Just define an interface `SurfaceDressupContext` that defines `dressupState`, `dressupStateVersion`, `_activeBindAnimationIdsCache`, etc. and use it cleanly.

4. **Verify changes**:
   - Run tests and linting.

5. **Complete pre-commit steps**:
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

6. **Submit PR**: create a PR titled "⚡ Bolt: Cache activeBindAnimationIds to prevent redundant sorting".
