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

- `src-tauri/src/commands/install/archive.rs:19` `if lower == "install.txt" || lower.ends_with("/install.txt") {`
- `src-tauri/src/commands/install/archive.rs:53` `// [install.txt（概要）], [同時インストール], [name,オブジェクト名], [type,種別], [directory,ディレクトリ名]`
- `src-tauri/src/commands/install/archive.rs:121` `"install.txt type={label} ({kind}): サポートされていないアーカイブ種別です"`
- `src-tauri/src/commands/install/archive.rs:263` `target_dir.join("install.txt"),`
- `src-tauri/src/common/paths.rs:120` `path.join("install.txt"),`
