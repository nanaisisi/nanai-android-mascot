# openurl,URL

- **規格**: [openurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/headline/descript-txt/) (ukadoc-spec/descript/headline/descript-txt/openurl.md)
- **検索語**: openurl
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/ext.rs` において `openurl` キーをパースし、`HeadlineInfo.url` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:98` `// [url,URL], [openurl,URL]:`
- `src-tauri/src/commands/ext.rs:99` `let url = map.get("url").cloned().or_else(|| map.get("openurl").cloned());`
