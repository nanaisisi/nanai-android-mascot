# 相対パス,ignore

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/updates_def-txt/entry/) (ukadoc-spec/descript/install/updates_def-txt/entry.md)
- **検索語**: ignore
- **対応状況**: ✅ 対応済

## 突合結果

`crates/ui/src/update.rs` (`parse_update_definition`) においてネットワーク更新定義 (`updates_def.txt` / `updates2.dau`) 内の相対パス行および `ignore`, `readonly`, `delete`, `size=` オプションフラグを自動解析・処理する実装が行われている。

## 実装箇所

- `src-tauri/gen/schemas/acl-manifests.json:1` `{"core":{"default_permission":{"identifier":"default","description":"Default cor`
- `src-tauri/gen/schemas/android-schema.json:1758` `"description": "Enables the set_ignore_cursor_events command without any pre-con`
- `src-tauri/gen/schemas/android-schema.json:1760` `"const": "core:window:allow-set-ignore-cursor-events",`
- `src-tauri/gen/schemas/android-schema.json:1761` `"markdownDescription": "Enables the set_ignore_cursor_events command without any`
- `src-tauri/gen/schemas/android-schema.json:2232` `"description": "Denies the set_ignore_cursor_events command without any pre-conf`
