# insert,ID

- **規格**: [insert.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/insert/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/insert.md)
- **検索語**: insert
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/src/fmo.rs:37` `ghosts.insert(`
- `src-tauri/src/commands/file.rs:169` `recent_files.insert(0, path);`
- `src-tauri/src/commands/config.rs:49` `target_sub.insert(sub_k, sub_v);`
- `src-tauri/src/commands/config.rs:53` `base_map.insert(k, other);`
- `src-tauri/src/commands/config.rs:99` `.or_insert_with(|| toml::Value::Table(toml::map::Map::new()));`
