# OnMenuExec

- **規格**: [OnMenuExec.md](https://ukatech.shillest.net/ukadoc-spec/list/plugin-event/plugin-event/OnMenuExec/) (ukadoc-spec/list/plugin-event/plugin-event/OnMenuExec.md)
- **検索語**: OnMenuExec
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「OnMenuExec」を確認。


## 実装箇所

- `src-tauri/src/commands/ext.rs:148` `"OnMenuExec" => Some(format!("\\0プラグイン「{}」が実行されました\\e", request.plugin_name)),`
