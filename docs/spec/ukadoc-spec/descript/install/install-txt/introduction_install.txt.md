# install.txt（概要）

- **規格**: [introduction_install.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/introduction_install.txt.md)
- **検索語**: install.txt
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive.rs` (`extract_ghost_archive_from_reader`) において `.nar` / `.zip` インストールアーカイブ内の `install.txt` を優先検出・自動判定する実装が行われている。

- **対応タイプ (`type`)**: `ghost`, `balloon`, `shell`, `plugin`, `headline`, `supplement`, `package`
- **解析ディレクティブ**: `charset`, `name`, `type`, `directory`, `accept`, `bootghost`, `refresh`, `refreshundeletemask`, `*.directory`, `*.source.directory`, `*.refresh`, `*.refreshundeletemask`
- **安全制御**: Zip Slip 攻撃防止 (`normalize_path`), Shift_JIS / UTF-8 エンコーディング自動判別・デコード

## 実装箇所

- `crates/ui/src/tests/vfs_files.rs:11` `"/../../assets/ghost/mock_nanai/install.txt"`
- `src-tauri/src/commands/install/archive/packaging.rs:132` `source_dir.join("install.txt"),`
- `ui/ts/ui/templates/ghost-templates.ts:97` `<li><strong>install.txt 自動解析:</strong> ゴースト名・ディレクトリ設定を自動認識</li>`
- `tests/install-protocol/install-error.test.ts:11` `parseInstallErrorReason("invalid type: install.txt type=unknown"),`
- `crates/ui/src/update/engine.rs:7` `/// アーカイブ内の install.txt をパースして InstallManifest を生成`
- `src-tauri/src/commands/install/archive/packaging.rs:153` `assert!(zip.by_name("install.txt").is_ok());`
