# インストール (manual/install.md)

- **規格**: [install.md](../../../ukadoc-spec/manual/install.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/install/))
- **検索語**: extract_ghost_archive_from_reader
- **対応状況**: ⚠️ 一部対応

配布アーカイブ形式（`nar` / `zip` / `lzh` / `cab` / 自己解凍 `exe`）、`install.txt`・`developer_options.txt`、およびゴースト・supplement・追加シェル・バルーン・同梱・複数インストール用パッケージの各構造に対する実装状況。ZIP/NAR 展開（Zip-Slip 対策・パスワード復号・`refresh`・`delete.txt`・同梱リソース展開）および NAR 作成コマンドは実装済である一方、`lzh`/`cab`/自己解凍 `exe`、追加シェルの対象ゴースト配下への解決、`package` 内の子 `install.txt` 個別展開、`developer_options.txt` に基づく NAR 除外制御等は未実装または一部対応。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [`nar` / `zip` アーカイブ展開・作成](install/nar-archive.md) | ✅ 実装済 | `pick_and_install_ghost_archive` / `install_ghost_archive` / `install_ghost_archive_bytes` (`src-tauri/src/commands/install/mod.rs`) と `extract_ghost_archive_from_reader` (`src-tauri/src/commands/install/archive/mod.rs`) で `.nar` / `.zip` を展開（Zip-Slip 検証・Shift_JIS ファイル名復号・暗号化パスワード対応）。`create_nar_archive` / `create_nar_from_directory` (`packaging.rs`) で NAR 作成も対応。 |
| [`lzh` / `cab` / 自己解凍 `exe`](install/nar-archive.md) | ❌ 未実装 | ファイルダイアログは `nar` / `zip` のみ許可し (`src-tauri/src/commands/install/mod.rs`)、展開処理は `zip::ZipArchive` 専用。`crates/nanai-core/src/install_protocol/helpers.rs` に失敗理由定数 `"unlha32"` / `"unlha32 error"` があるのみで展開は未実装。 |
| [標準的なゴーストアーカイブ (`ghost` / `shell` / `install.txt` 等)](install/standard-ghost.md) | ✅ 実装済 | `inspect_zip_archive` (`src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs`) が `type,ghost` および階層オフセット (`root_prefix`) を自動検出し、`assets/ghost/<dir>/` へ展開して `delete.txt` 処理まで実行（インストール前 `terms.txt` ダイアログ中断のみ未実装）。 |
| [`supplement` アーカイブ構造](install/supplement.md) | ⚠️ 一部対応 | `inspect_zip_archive` が `type,supplement` を受理し `assets/ghost/<dir>/` 配下へディレクトリ構造を保って展開する。ただし `accept` 値を用いた既存対象ゴーストの自動特定・マージや不一致時の拒否 (`OnInstallRefuse`) は未実装。 |
| [標準的な追加シェルアーカイブ (`additional_shell`)](install/additional-shell.md) | ⚠️ 一部対応 | `inspect_zip_archive` が `type,shell` を受理して展開するが、展開先が `assets/shell/<dir>/` 固定であり、`accept` による対象ゴーストの `shell/<additional_shell>/` 配下への配置は未実装。 |
| [標準的なバルーンアーカイブ (`myballoon`)](install/standard-balloon.md) | ✅ 実装済 | `type,balloon` を `assets/balloon/<dir>/` へ展開し、`flatten_balloon_directory` (`src-tauri/src/commands/install/utils.rs`) で単一ラッパーフォルダを正規化して直接配置する。 |
| [ゴーストへのバルーン等同梱 (`balloon.directory` 等)](install/bundled-package.md) | ⚠️ 一部対応 | `resolve_bundled_resources_config` (`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs`) と `extract_zip_entries` (`extraction.rs`) で無印・連番 `0, 1, 2...` の `balloon` / `headline` / `plugin` / `shell` / `calendar.skin` / `calendar.plugin` を同梱先へ直接展開（同梱側 `install.txt` を無視）。ただし `ghost with balloon` 種別文字列や `shell` の対象ゴースト内展開は未対応。 |
| [(SSP専用) 複数インストール用パッケージ (`type,package`)](install/multi-install-package.md) | ⚠️ 一部対応 | `inspect_zip_archive` で `type,package` を受理し、`ui/ts/core/actions/install-protocol.ts` に `OnInstallCompleteAll` 引数生成がある。ただし展開処理は最浅階層の単一 `install.txt` のみ解析し、各子ディレクトリ内の個別 `install.txt` を再帰処理する多段展開は未実装。 |
| その他 (ヘッドラインセンサ・プラグイン単体配布・[`install.txt`](install/install-txt.md)) | ✅ 実装済 | `type,plugin` を `assets/plugin/<dir>/`、`type,headline` を `assets/headline/<dir>/` へ最上位 `install.txt` 基準で展開 (`zip_inspector.rs`)。 |
| [`install.txt`](install/install-txt.md) | ⚠️ 一部対応 | `parse_zip_entry_descript` (`src-tauri/src/commands/install/utils.rs`) と `inspect_zip_archive` で `name`、`type`、`directory`、`refresh`、`refreshundeletemask`、同梱リソース指定を解析・適用。`accept`・`bootghost` は抽出のみ行われインストール後処理では未使用。 |
| [`developer_options.txt` (アーカイブ作成時の除外設定)](install/developer-options-txt.md) | ⚠️ 一部対応 | `create_nar_from_directory` (`src-tauri/src/commands/install/archive/packaging.rs`) は固定除外リスト (`profile`、`var`、`.git`、`thumbs.db` 等) でパッキングし、各コンテンツ階層 `developer_options.txt` の `nonar` 等は未読込（`noupdate=` 解析は `crates/nanai-core/src/update_protocol/helpers.rs` と `generation.rs` で更新生成用に実装済）。 |

## 実装箇所

- `src-tauri/src/commands/install/mod.rs:45` `pub async fn install_ghost_archive(`
- `src-tauri/src/commands/install/archive/mod.rs:16` `pub fn extract_ghost_archive_from_reader<R: std::io::Read + std::io::Seek>(`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:7` `pub fn inspect_zip_archive<R: std::io::Read + std::io::Seek>(`
- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs:6` `pub fn resolve_bundled_resources_config(`
- `src-tauri/src/commands/install/archive/packaging.rs:34` `pub fn create_nar_from_directory(source_dir: &Path, output_nar_path: &Path) -> Result<u64, String> {`
- `crates/nanai-core/src/install_protocol/helpers.rs:7` `pub fn normalize_install_type(install_type: Option<&str>) -> String {`
