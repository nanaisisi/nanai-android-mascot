# `surface*.pna`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: load_surface_pna
- **対応状況**: ✅ 実装済

## 突合結果

`load_surface_pna` による `surface*.pna` の大文字小文字非区別探索と、`process_chroma_key_data` / `processChromaKey` での PNA アルファチャンネル合成を実装済み。`seriko.use_self_alpha` の参照と `isPixelTransparent` による非完全透明ピクセルの当たり判定も実装およびテスト済み。

## 実装箇所

- `src-tauri/src/commands/file/surface_image.rs:149` `pub fn load_surface_pna(`
- `crates/nanai-core/src/surface_compositor.rs:166` `if let Some(pna) = pna_data {`
- `ui/ts/surface/surface-compositor.ts:179` `if (pnaData) {`
- `ui/ts/surface/surface-manager.ts:918` `const useSelfAlpha =`
- `ui/ts/surface/surface-render.ts:231` `const useSelfAlpha =`
- `ui/ts/surface/interaction/transparency.ts:10` `export function isPixelTransparent(`
- `tests/ghost-surface.test.ts:31` `if (cmd === "load_surface_pna") throw new Error("no pna");`
