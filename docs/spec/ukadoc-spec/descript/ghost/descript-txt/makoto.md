# makoto,ファイル名

- **規格**: [makoto.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/makoto.md)
- **検索語**: makoto
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `makoto` キーをパース・参照する実装が行われている。

## 実装箇所

- `crates/ui/src/fmo/tests/buffer_processing.rs:36` `modulestate: Some("shiori:running,makoto-ghost:running".to_string()),`
- `src-tauri/src/commands/shell/ghost.rs:31` `makoto: manifest.makoto,`
- `ui/ts/ghost/command-handler/defaults/system-handlers.ts:267` `registerCommandHandler("load:makoto", async (handler, args) => {`
- `tests/sakura-command-handler/cycle10-commands.test.ts:9` `it("handles load,makoto, unload,makoto, and reload,makoto commands", async () =>`
- `crates/ui/src/fmo/tests/buffer_processing.rs:66` `Some("shiori:running,makoto-ghost:running".to_string())`
- `src-tauri/src/common/models.rs:38` `pub makoto: Option<String>,`
