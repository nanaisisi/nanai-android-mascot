# 追加シェルのネットワーク更新ファイル配置

- **規格**: [update.md](../../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: update_shell
- **対応状況**: ✅ 実装済

## 突合結果

追加シェル単位のネットワーク更新コマンド `update_shell`（`src-tauri/src/commands/update/network/commands/execute.rs:184`）を実装し、`src-tauri/src/invoke.rs:91` に登録している。`<ghost_dir>/shell/<shell_name>` を解決し、`descript.txt` の `homeurl` から `check_dir_update` / `execute_dir_update` を通じて `updates2.dau` / `updates.txt` / `developer_options.txt`（`noupdate`）/ MD5 検証 / `delete.txt`・`delete1.txt` の一連の更新パイプラインを実行する。

## 実装箇所

- `src-tauri/src/commands/update/network/commands/execute.rs:184` `pub async fn update_shell(`
- `src-tauri/src/invoke.rs:91` `commands::update::network::commands::update_shell,`
