# install.txt（概要）

- **規格**: [introduction_install.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/introduction_install.txt.md)
- **検索語**: install.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive.rs` (`extract_ghost_archive_from_reader`) において `.nar` / `.zip` インストールアーカイブ内の `install.txt` を優先検出・自動判定する実装が行われている。

- **対応タイプ (`type`)**: `ghost`, `balloon`, `shell`, `plugin`, `headline`, `supplement`, `package`
- **解析ディレクティブ**: `charset`, `name`, `type`, `directory`, `accept`, `bootghost`, `refresh`, `refreshundeletemask`, `*.directory`, `*.source.directory`, `*.refresh`, `*.refreshundeletemask`
- **安全制御**: Zip Slip 攻撃防止 (`normalize_path`), Shift_JIS / UTF-8 エンコーディング自動判別・デコード

## 実装箇所

- `src-tauri/src/commands/install/archive/packaging.rs:132` `source_dir.join("install.txt"),`
- `src-tauri/src/commands/install/archive/packaging.rs:153` `assert!(zip.by_name("install.txt").is_ok());`
- `src-tauri/src/commands/install/archive/postprocess.rs:82` `target_dir.join("install.txt"),`
- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs:4` `/// install.txt の規約に従い、同梱リソース (balloon, headline, plugin, shell, calendar.skin, `
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:22` `if lower == "install.txt" || lower.ends_with("/install.txt") {`
