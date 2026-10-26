# insert,ID

- **規格**: [insert.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/insert/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/insert.md)
- **検索語**: insert
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:48` `map.insert(key.trim().to_lowercase(), val.trim().to_string());`
- `src-tauri/src/ghost/scan.rs:50` `map.insert(key.trim().to_lowercase(), val.trim().to_string());`
- `src-tauri/src/commands/file.rs:164` `recent_files.insert(0, path);`
- `src-tauri/src/commands/shiori/lifecycle.rs:67` `.insert("main".to_string(), ghost_name.clone());`
- `src-tauri/src/commands/shiori/lifecycle.rs:144` `.insert(instance_id.clone(), engine);`
