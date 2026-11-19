# 追加シェルのネットワーク更新ファイル配置

- **規格**: [update.md](../../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: update_shell
- **対応状況**: ❌ 未実装

## 突合結果

`(myshell)` 直下に `ghost` / `shell` / `updates2.dau` / `updates.txt` / `delete.txt` / `developer_options.txt` 等を配置する、SSP 独自の追加シェル単位ネットワーク更新処理は未実装。現行の `check_ghost_update` / `execute_ghost_update`（`src-tauri/src/commands/update/network/commands/check.rs`・`execute.rs`）および `ui/ts/core/app-update.ts` はゴースト単位のみを対象としており、`ui/ts/core/actions/update-protocol.ts:235-268` や `crates/nanai-core/src/update_protocol/events/args.rs:155` に `OnUpdateOther*` 用の汎用引数ヘルパーがあるのみで追加シェル個別の更新機能は接続されていない。

## 実装箇所

実装コード内に「update_shell」は検出されませんでした。
