# openurl,URL

- **規格**: [openurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/headline/descript-txt/) (ukadoc-spec/descript/headline/descript-txt/openurl.md)
- **検索語**: openurl
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/ext.rs` において `openurl` キーのパースおよび `HeadlineInfo.url` 設定が完全実装済み。

## 実装箇所

- `src-tauri/src/commands/ext.rs:114` `.or_else(|| map.get("openurl").cloned());`
