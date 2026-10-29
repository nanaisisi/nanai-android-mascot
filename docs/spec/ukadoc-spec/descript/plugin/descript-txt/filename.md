# filename,dll

- **規格**: [filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/filename/) (ukadoc-spec/descript/plugin/descript-txt/filename.md)
- **検索語**: filename
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「filename」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/shiori/lifecycle/load.rs:34` `&& let Some(shiori_filename) = map.get("shiori")`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:36` `let rel_path = shiori_filename.trim();`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:27` `&& let Some(shiori_filename) = map.get("shiori")`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:29` `let rel_path = shiori_filename.trim();`
- `src-tauri/src/ghost/scan/shell.rs:123` `.get("menu.background.bitmap.filename")`
