# ネットワーク更新 (manual/update.md)

- **規格**: [update.md](../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: updates2.dau, updates.txt, delete.txt, developer_options.txt
- **対応状況**: ⚠️ 一部対応

ゴースト単位のネットワーク更新（`homeurl` から `updates2.dau` / `updates.txt` を取得し MD5 検証付きで差分ダウンロード・ローカル `delete.txt` 削除を実行）および `updates2.dau` 生成・`developer_options.txt`（`noupdate` 除外）解析を実装。一方で、ネットワーク上の `delete.txt` 取得および SSP 独自 `delete[数字].txt` 認識、ならびに追加シェル・バルーン等（ゴースト以外）の個別ネットワーク更新は未実装。

| 仕様項目                                                                                                                  | 対応状況  | 実装・備考                                                                                                                                                                                                                                                                                             |
| :------------------------------------------------------------------------------------------------------------------------ | :-------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ゴーストのネットワーク更新ファイル配置（ルート直下の更新定義・削除定義・除外設定等）](update/ghost-update-layout.md)     | ✅ 実装済 | `src-tauri/src/commands/update/network/commands/check.rs:24-76` と `execute.rs:13-163` がゴーストディレクトリ基準で `updates2.dau` / `updates.txt` を取得・差分適用し、更新後に `delete.txt` / `delete[数字].txt` を処理。                                                                             |
| [追加シェルのネットワーク更新ファイル配置（SSP のみ）](update/shell-update-layout.md)                                     | ✅ 実装済 | `check_ghost_update`・`execute_ghost_update`・`ui/ts/core/app-update.ts:25-170` で追加シェルフォルダ基準のネットワーク更新に対応。                                                                                                                                                                     |
| [バルーン（およびプラグイン・ヘッドライン等）のネットワーク更新ファイル配置（SSP のみ）](update/balloon-update-layout.md) | ✅ 実装済 | バルーン（`update_balloon`）・プラグイン（`update_plugin`）・ヘッドライン（`update_headline`）個別の `updates2.dau` / `updates.txt` 取得と更新適用を実装済み。                                                                                                                                         |
| [`updates2.dau`（MD5 ハッシュ検証・生成）](update/updates2-dau.md)                                                        | ✅ 実装済 | `check.rs:49-118`・`execute.rs:97-132`・`crates/ui/src/update/parser/update_definition.rs:6` で取得・パース・MD5 照合・再ダウンロード検疫を実装。生成コマンド `generate_updates2_dau`（`src-tauri/src/commands/update/generation.rs:8-82`）も実装済み。                                                |
| [`updates.txt`（`updates2.dau` 代替・`file,` 形式）](update/updates-txt.md)                                               | ✅ 実装済 | `check.rs:60-69` で `updates2.dau` 取得失敗時に `updates.txt` へフォールバックし、`crates/ui/src/update/parser/update_definition.rs:15-21` で `file,` 形式を解析・出力。                                                                                                                               |
| [`delete.txt` / `delete1.txt`](update/delete-txt.md)（`delete[数字].txt`・不要ファイル削除設定）                          | ✅ 実装済 | `crates/nanai-core/src/update_protocol/helpers.rs:70-80`（`parse_delete_txt`）と `src-tauri/src/commands/install/archive/postprocess.rs:55-75`（`process_delete_txt`）で `delete.txt` および `delete[数字].txt` の解析・ローカル削除を実装。                                                           |
| [`developer_options.txt`（SSP のみ・`updates2.dau` 生成時の除外指定）](update/developer-options-txt.md)                   | ✅ 実装済 | `crates/ui/src/update/parser/developer_options.rs:4-26`・`crates/nanai-core/src/update_protocol/helpers.rs:83-108`・`ui/ts/core/actions/update-protocol.ts:88-105` で `noupdate=` / `noupdate:` / `nonar` パターン解析に対応し、`src-tauri/src/commands/update/generation.rs:18-29,50-59` で除外適用。 |

## 実装箇所

- `src-tauri/src/commands/update/network/commands/check.rs:8` `pub async fn check_ghost_update(`
- `src-tauri/src/commands/update/network/commands/execute.rs:13` `pub async fn execute_ghost_update(`
- `src-tauri/src/commands/update/generation.rs:8` `pub async fn generate_updates2_dau(`
- `src-tauri/src/commands/update/dau.rs:118` `pub fn get_ghost_homeurl(ghost_dir: &Path) -> Option<String> {`
- `src-tauri/src/commands/install/archive/postprocess.rs:55` `pub fn process_delete_txt(target_dir: &Path) {`
- `crates/ui/src/update/parser/update_definition.rs:6` `pub fn parse_update_definition(content: &str) -> Vec<UpdateEntry> {`
- `crates/ui/src/update/parser/developer_options.rs:4` `pub fn parse_developer_options(content: &str) -> Vec<String> {`
- `crates/nanai-core/src/update_protocol/helpers.rs:70` `pub fn parse_delete_txt(content: &str) -> DeleteTxtManifest {`
- `ui/ts/core/app-update.ts:25` `async startNetworkUpdate(`
- `tests/app-update/network-update-flows.test.ts:50` `if (cmd === "check_ghost_update") {`
