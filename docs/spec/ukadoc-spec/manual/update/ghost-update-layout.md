# ゴーストのネットワーク更新ファイル配置

- **規格**: [update.md](../../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: check_ghost_update, execute_ghost_update, startNetworkUpdate
- **対応状況**: ✅ 実装済

## 突合結果

`(myghost)` ルート直下に配置する `updates2.dau`・`updates.txt`・`delete.txt`・`developer_options.txt` 等を基準としたゴースト単位のネットワーク更新フローを実装している。`src-tauri/src/commands/update/network/commands/check.rs:24-76`（`check_ghost_update`）が `get_ghost_homeurl`（`src-tauri/src/commands/update/dau.rs:118`）で解決した `homeurl` からゴーストルート相対の `updates2.dau` / `updates.txt` を取得・差分判定し、`src-tauri/src/commands/update/network/commands/execute.rs:13-163`（`execute_ghost_update`）と `ui/ts/core/app-update.ts:25-173`（`startNetworkUpdate`）がダウンロード・MD5 検証・`delete.txt` クリーンアップ・SHIORI 更新イベント通知を実行する（`tests/app-update/network-update-flows.test.ts:50-67`）。また `generate_updates2_dau`（`src-tauri/src/commands/update/generation.rs:69-76`）もゴーストルート直下および `ghost/master/updates2.dau` へ出力する。

## 実装箇所

- `src-tauri/src/commands/update/network/commands/check.rs:8` `pub async fn check_ghost_update(`
- `src-tauri/src/commands/update/network/commands/execute.rs:13` `pub async fn execute_ghost_update(`
- `src-tauri/src/commands/update/dau.rs:118` `pub fn get_ghost_homeurl(ghost_dir: &Path) -> Option<String> {`
- `src-tauri/src/commands/update/generation.rs:8` `pub async fn generate_updates2_dau(`
- `ui/ts/core/app-update.ts:25` `async startNetworkUpdate(`
- `tests/app-update/network-update-flows.test.ts:50` `if (cmd === "check_ghost_update") {`
