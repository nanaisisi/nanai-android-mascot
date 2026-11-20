# ghost/master/makoto.dll

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: makoto.dll
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `makoto.dll`（トランスレート用 DLL）について、`src-tauri/src/shiori/makoto.rs` にて Windows 向けの C-ABI `HGLOBAL` プロトコル（`load` / `unload` / `request`、`EXECUTE MAKOTO/2.0` リクエスト生成・レスポンス解析）を実装済み。非 Windows 環境（Android 等）ではエラーを返すスタブとなる。また `parse_ghost_manifest` で `descript.txt` の `makoto` キーを取得する処理と、TS 側コマンドハンドラ（`handleLoadMakoto` / `handleUnloadMakoto` / `handleReloadMakoto`）の分岐フックが存在する。

## 実装箇所

- `src-tauri/src/shiori/makoto.rs:55` `pub fn execute_makoto_dll(dll_path: &Path, script: &str) -> Result<String, String> {`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:53` `let makoto = meta_map.as_ref().and_then(|m| m.get("makoto").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest/tests.rs:18` `makoto,makoto.dll\r\n\`
- `ui/ts/ghost/command-handler/system/shiori.ts:101` `export async function handleLoadMakoto(`
- `tests/sakura-command-handler/cycle10-commands.test.ts:26` `await handler.runCommand(["load", "makoto", "my_makoto.dll"]);`
