# ゴースト側 makoto.dll (ghost/master/makoto.dll)

- **規格**: [translator.md](../../../../ukadoc-spec/manual/translator.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/translator/))
- **検索語**: makoto, loadMakoto, handleLoadMakoto
- **対応状況**: ⚠️ 一部対応

## 突合結果

ゴースト側 `descript.txt`（`ghost/master/descript.txt`）の `makoto` キー解析（`src-tauri/src/ghost/scan/directory/manifest/parser.rs:53`）、`GhostManifest` / `GhostInfo` への保持・伝搬（`src-tauri/src/ghost/scan/directory/manifest/types.rs:13`・`src-tauri/src/common/models/ghost.rs:15,64`・`src-tauri/src/ghost/scan/directory/scan.rs:86`・`src-tauri/src/commands/shell/ghost.rs:31`）、およびさくらスクリプト `\![load,makoto,...]` / `\![unload,makoto,...]` / `\![reload,makoto,...]` のコマンドディスパッチと `ghostController.loadMakoto` 等への委譲フック（`ui/ts/ghost/command-handler/defaults/system-handlers.ts:264-283`・`ui/ts/ghost/command-handler/system/shiori.ts:101-141`・`tests/sakura-command-handler/cycle10-commands.test.ts:9-48`）は実装されている。また FMO テスト（`crates/ui/src/fmo/tests/buffer_processing.rs:36`）にも `makoto-ghost:running` 状態の記述がある。一方で、`ghost/master/makoto.dll`（および `descript.txt` 指定 DLL）の実ファイル検出、C-ABI / DLL 動的ロード・`request` 呼び出し、ならびに `ghostController.loadMakoto` 等のバックエンド実処理は未実装。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:53` `let makoto = meta_map.as_ref().and_then(|m| m.get("makoto").cloned());`
- `src-tauri/src/common/models/ghost.rs:64` `pub fn makoto(&self) -> Option<&str> {`
- `src-tauri/src/ghost/scan/directory/scan.rs:86` `makoto: manifest.makoto().map(ToString::to_string),`
- `ui/ts/ghost/command-handler/system/shiori.ts:101` `export async function handleLoadMakoto(`
- `ui/ts/ghost/command-handler/defaults/system-handlers.ts:264` `registerCommandHandler("loadmakoto", async (handler, args) => {`
- `tests/sakura-command-handler/cycle10-commands.test.ts:9` `it("handles load,makoto, unload,makoto, and reload,makoto commands", async () => {`


## 実装状況の更新

ゴースト側 makoto.dll の配置検出は `find_ghost_makoto`（`src-tauri/src/ghost/scan/translator.rs`）で実装済み。DLL の動的ロード・`request` 呼び出しは Windows 専用 DLL（C-ABI）のため Android では不可であり、⚠️ 一部対応のまま据え置く。
