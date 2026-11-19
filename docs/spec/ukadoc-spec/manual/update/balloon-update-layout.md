# バルーン・プラグイン・ヘッドラインのネットワーク更新ファイル配置

- **規格**: [update.md](../../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: update_balloon
- **対応状況**: ⚠️ 一部対応

## 突合結果

バルーン単位のネットワーク更新コマンド `update_balloon`（`src-tauri/src/commands/update/network/commands/execute.rs:212`）を実装し、`src-tauri/src/invoke.rs:92` に登録している。`<balloon_dir>` を解決し、`descript.txt` の `homeurl` から `check_dir_update` / `execute_dir_update` を通じて `updates2.dau` / `updates.txt` / `developer_options.txt`（`noupdate`）/ MD5 検証 / `delete.txt`・`delete1.txt` の更新パイプラインを実行する。一方で、プラグインおよびヘッドライン向けの個別ネットワーク更新コマンドは未実装（`UPDATE_TARGET_TYPES` と `OnUpdateOther*` 引数生成ヘルパーのみ定義済み）。

## 実装箇所

- `src-tauri/src/commands/update/network/commands/execute.rs:212` `pub async fn update_balloon(`
- `src-tauri/src/invoke.rs:92` `commands::update::network::commands::update_balloon,`
