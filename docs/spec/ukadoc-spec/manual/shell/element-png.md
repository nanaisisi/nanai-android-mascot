# `(element).png`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: composeSurfaceElements, compute_surface_composition_plan
- **対応状況**: ✅ 実装済

## 突合結果

`compute_surface_composition_plan`・`Shell::composition_plan`・`surface_composition_plan`・`composeSurfaceElements` により `element` 指定パーツ画像の合成計画とレイヤー描画を実装済み。非 Tauri 経路・Tauri 経路ともに任意の `(element).png` ファイル名パーツを直接読み込める。

## 実装箇所

- `crates/nanai-core/src/surface_compositor.rs:79` `layers.push(elem.clone());`
- `crates/ui/src/shell/core.rs:159` `pub fn composition_plan(`
- `src-tauri/src/commands/shell/manifest.rs:158` `pub fn surface_composition_plan(`
- `ui/ts/surface/surface-render.ts:190` `const plan = computeSurfaceCompositionPlan(`
- `ui/ts/surface/ghost-surface-dom.ts:88` `const resolveId =`
- `ui/ts/surface/ghost-surface-dom.ts:141` `transparentSrc =`
