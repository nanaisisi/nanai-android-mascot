# install.txt（概要）

- **規格**: [introduction_install.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/introduction_install.txt.md)
- **検索語**: install.txt
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` (`extract_ghost_archive_from_reader`) において `.nar` / `.zip` インストールアーカイブ内の `install.txt` を優先検出・自動判定する実装が行われている。

- **対応タイプ (`type`)**: `ghost`, `balloon`, `shell`, `plugin`, `headline`, `supplement`, `package`
- **解析ディレクティブ**: `charset`, `name`, `type`, `directory`, `accept`, `bootghost`, `refresh`, `refreshundeletemask`, `*.directory`, `*.source.directory`, `*.refresh`, `*.refreshundeletemask`
- **安全制御**: Zip Slip 攻撃防止 (`normalize_path`), Shift_JIS / UTF-8 エンコーディング自動判別・デコード

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection.rs:29` `if lower == "install.txt" || lower.ends_with("/install.txt") {`
- `src-tauri/src/commands/install/archive/inspection.rs:117` `"install.txt type={label} ({kind}): サポートされていないアーカイブ種別です"`
- `src-tauri/src/commands/install/archive/packaging.rs:112` `fs::write(source_dir.join("install.txt"), "type,ghost\nname,TestGhost\n").unwrap`
- `src-tauri/src/commands/install/archive/packaging.rs:126` `assert!(zip.by_name("install.txt").is_ok());`
- `src-tauri/src/commands/install/archive/postprocess.rs:34` `target_dir.join("install.txt"),`
