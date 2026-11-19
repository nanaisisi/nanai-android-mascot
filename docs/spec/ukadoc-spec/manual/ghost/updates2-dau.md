# ghost/master/updates2.dau (旧仕様)

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: updates2.dau
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `updates2.dau`（`ghost/master/` 配下に置かれる旧仕様位置）について、`generate_updates2_dau` はルート直下の `updates2.dau` に加え `ghost/master/` が存在する場合は `ghost/master/updates2.dau` へも同一内容を書き出す。一方で、`scan_ghost_directory` の更新状態確認および `check_ghost_update` のリモート取得先は現行仕様であるゴーストルート直下（`{homeurl}updates2.dau`）を基準としており、旧仕様位置 `ghost/master/updates2.dau` 単独の参照・フォールバック読込は行わない。

## 実装箇所

- `src-tauri/src/commands/update/generation.rs:72` `let ghost_master = dir.join("ghost").join("master");`
- `src-tauri/src/commands/update/generation.rs:74` `let master_dau = ghost_master.join("updates2.dau");`
- `src-tauri/src/commands/update/network/commands/check.rs:51` `let url_dau = format!("{}updates2.dau", homeurl);`
- `src-tauri/src/ghost/scan/directory/scan.rs:68` `let dau_path = path.join("updates2.dau");`
- `crates/ui/src/update/tests/definition_package/updates_parser.rs:6` `fn test_parse_updates2_dau_byte1_delimited() {`
