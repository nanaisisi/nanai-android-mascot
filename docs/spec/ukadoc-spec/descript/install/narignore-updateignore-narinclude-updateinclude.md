# .narignore / .updateignore / .narinclude / .updateinclude

- **規格**: [narignore-updateignore-narinclude-updateinclude.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/narignore-updateignore-narinclude-updateinclude/) (ukadoc-spec/descript/install/narignore-updateignore-narinclude-updateinclude.md)
- **検索語**: .narignore
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory/filter.rs` (`should_skip_directory`) において `.narignore`, `.updateignore`, `.narinclude`, `.updateinclude` ファイル群の検出・評価およびスキャン・除外制御処理が完全実装済み。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/filter.rs:6` `path.join(".narignore").exists()`
