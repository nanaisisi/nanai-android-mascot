# index

- **規格**: [index-item.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/index-item/)
- **検索語**: index
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「index」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/file.rs:164` `if let Some(index) = recent_files.iter().position(|x| *x == path) {`
- `src-tauri/src/commands/file.rs:165` `recent_files.remove(index);`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:96` `"index.html?ghost_id={}&ghost_name={}",`
- `src-tauri/src/commands/install/archive.rs:13` `if let Ok(entry) = zip.by_index(i) {`
- `src-tauri/src/commands/install/archive.rs:44` `&& let Ok(mut entry) = zip.by_index(idx)`
