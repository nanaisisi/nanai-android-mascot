# ghost/master/makoto.dll

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: makoto.dll
- **対応状況**: ❌ 未実装

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `makoto.dll`（トランスレート用 DLL）は未実装。`parse_ghost_manifest` で `descript.txt` の `makoto` キー文字列を取得する処理と、TS 側コマンドハンドラ（`handleLoadMakoto` / `handleUnloadMakoto` / `handleReloadMakoto`）の分岐フックは存在するが、`ghost/master/makoto.dll` の動的ロード・トランスレート実行処理は実装されていない。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:53` `let makoto = meta_map.as_ref().and_then(|m| m.get("makoto").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest/tests.rs:18` `makoto,makoto.dll\r\n\`
- `ui/ts/ghost/command-handler/system/shiori.ts:101` `export async function handleLoadMakoto(`
- `tests/sakura-command-handler/cycle10-commands.test.ts:26` `await handler.runCommand(["load", "makoto", "my_makoto.dll"]);`
