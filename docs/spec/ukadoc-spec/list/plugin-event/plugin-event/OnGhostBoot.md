# OnGhostBoot

- **規格**: [OnGhostBoot.md](https://ukatech.shillest.net/ukadoc-spec/list/plugin-event/plugin-event/OnGhostBoot/) (ukadoc-spec/list/plugin-event/plugin-event/OnGhostBoot.md)
- **検索語**: OnGhostBoot
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「OnGhostBoot」を確認。


## 実装箇所

- `src-tauri/src/commands/ext.rs:170` `"OnGhostBoot" => Some("".to_string()),`
- `ui/js/ghost/ghost-shiori.js:38` `// [PLUGIN/2.0]: OnGhostBoot event broadcast to available plugins`
- `ui/js/ghost/ghost-shiori.js:44` `eventId: "OnGhostBoot",`
