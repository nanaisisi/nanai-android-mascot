# `surface*.png`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: load_surface_image
- **対応状況**: ✅ 対応済み

## 突合結果

`load_surface_image` が `surface{id}.png` / `surface{id:04}.png` / `surface{id:02}.png` / BMP / SVG / GIF / WebP / JPEG を大文字小文字非区別で探索し、`surface0`・`surface10` フォールバックや `u32` ID（8192 超を含む）に対応。左上 `(0,0)` ピクセル色を基準とした透過処理は `process_chromakey_image_bytes`・`process_chroma_key_data`・`processChromaKey` で実行する（右上色および緑背景も追加透過）。GIF / WebP および APNG（`is_apng` による `acTL` チャンク検出）はクロマキー再エンコードをスキップして元バイト列のまま Data URL 化し、WebView での自動再生に対応（非推奨の暗号化 PNG `DAP`/`DDP`/`DFP`/`DGP` のみ非対応）。

## 実装箇所

- `src-tauri/src/commands/file/surface_image.rs:11` `pub fn load_surface_image(`
- `src-tauri/src/commands/file/helpers.rs:20` `pub fn process_chromakey_image_bytes(bytes: &[u8]) -> Option<String> {`
- `crates/nanai-core/src/surface_compositor.rs:109` `pub fn process_chroma_key_data(`
- `ui/ts/surface/surface-compositor.ts:69` `export async function processChromaKey(`
- `ui/ts/surface/surface-compositor.ts:145` `// 左上 (0,0) ピクセルの背景色を取得`
- `tests/ghost-surface.test.ts:27` `if (cmd === "load_surface_image") {`
- `tests/surface-compositor-chromakey.test.ts:4` `describe("processChromaKey chroma-key transparency unit tests", () => {`
