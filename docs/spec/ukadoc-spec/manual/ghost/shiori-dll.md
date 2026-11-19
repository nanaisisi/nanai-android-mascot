# ghost/master/shiori.dll および外部辞書リソース

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: ShioriDynamicEngine
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `shiori.dll` および外部辞書等のリソースファイルについて、Desktop 環境では `load_ghost` / `spawn_ghost` が `descript.txt` の `shiori` キーまたは既定候補（`yaya.dll`・`satori.dll`・`kawari.dll`・`shiori.dll` 等 / Unix `.so`）を探索し、`ShioriDynamicEngine::load_library` が `loadu`/`load`・`unload`・`request`（Windows 64bit 上の 32bit DLL は `shiori-host32.exe` 経由）をロードして `ghost/master/` パスを `load()` に渡すため、各 SHIORI が外部辞書を読み込める。一方 Android 環境は `ShioriError::LibraryLoadAndroid` を返し C-ABI DLL ロード非対応で、Web/Android 向けには `WasmShioriLoader` が仮想ファイルマウント（`mountVirtualFile`）を提供する。

## 実装箇所

- `src-tauri/src/commands/shiori/lifecycle/load.rs:9` `pub async fn load_ghost(`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:9` `pub async fn spawn_ghost(`
- `src-tauri/src/shiori/dynamic/engine.rs:36` `pub fn load_library(dll_path: &Path) -> Result<Self, ShioriError> {`
- `src-tauri/src/shiori/dynamic/engine.rs:109` `pub fn load_library(dll_path: &Path) -> Result<Self, ShioriError> {`
- `src-tauri/shiori-host/src/main.rs:29` `fn main() {`
- `ui/ts/ghost/wasm-shiori-loader.ts:53` `mountVirtualFile(path: string, data: Uint8Array): void {`
