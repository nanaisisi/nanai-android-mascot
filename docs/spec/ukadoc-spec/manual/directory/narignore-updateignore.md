# .narignore / .updateignore / .narinclude / .updateinclude

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: .narignore, .updateignore, .narinclude, .updateinclude
- **対応状況**: ❌ 未実装

## 突合結果

`docs/ukadoc-spec/manual/directory.md` の `(myghost)/.narignore`・`.updateignore`・`.narinclude`・`.updateinclude`（SSP 専用の NAR 作成および更新ファイル生成時のファイル単位の除外・包含パターン定義）は未実装。`create_nar_from_directory`（`packaging.rs`）および `generate_updates2_dau`（`generation.rs`）はこれらのファイルを読み込んでパターン適用しない。なお `should_skip_directory`（`filter.rs`）に 4 ファイルの存在チェックがあるが、仕様とは異なり「該当ゴーストディレクトリ全体をスキャン対象から除外する」判定としてのみ利用されている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/filter.rs:4` `pub fn should_skip_directory(path: &Path) -> bool {`
- `src-tauri/src/ghost/scan/directory/filter.rs:6` `|| path.join(".narignore").exists()`
- `src-tauri/src/ghost/scan/directory/filter.rs:7` `|| path.join(".updateignore").exists()`
- `src-tauri/src/ghost/scan/directory/filter.rs:8` `|| path.join(".narinclude").exists()`
- `src-tauri/src/ghost/scan/directory/filter.rs:9` `|| path.join(".updateinclude").exists()`
