# homeurl,URL

- **規格**: [homeurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/homeurl.md)
- **検索語**: homeurl
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `homeurl` キーをパース（`craftmanurl` のフォールバックおよびネットワーク更新参照用）し、`GhostInfo.craftman_url` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:44` `.or_else(|| map.get("homeurl").cloned());`
- `src-tauri/src/commands/ext.rs:109` `.or_else(|| map.get("homeurl").cloned());`
- `src-tauri/src/commands/update/dau.rs:10` `pub homeurl: String,`
- `src-tauri/src/commands/update/dau.rs:44` `if let Some(url) = desc.homeurl() {`
- `src-tauri/src/commands/update/dau.rs:57` `if let Some(url) = desc.homeurl() {`
