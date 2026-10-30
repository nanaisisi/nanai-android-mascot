# .narignore / .updateignore / .narinclude / .updateinclude

- **規格**: [narignore-updateignore-narinclude-updateinclude.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/narignore-updateignore-narinclude-updateinclude/) (ukadoc-spec/descript/install/narignore-updateignore-narinclude-updateinclude.md)
- **検索語**: .narignore
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `.narignore`, `.updateignore`, `.narinclude`, `.updateinclude`, `.dev_ignore` の存在判定および除外・保護ハンドリングを行う実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:50` `// [.narignore / .updateignore / .narinclude / .updateinclude]: アーカイブ・更新除外および開発無`
- `src-tauri/src/ghost/scan/directory.rs:52` `|| path.join(".narignore").exists()`
- `src-tauri/src/ghost/scan/directory.rs:57` `println!("🚫 Skipping ghost directory with .dev_ignore/.narignore/.updateignore: `
