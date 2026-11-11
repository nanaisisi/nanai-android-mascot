# url,URL

- **規格**: [url.md](https://ukatech.shillest.net/ukadoc-spec/descript/headline/descript-txt/) (ukadoc-spec/descript/headline/descript-txt/url.md)
- **検索語**: url
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/ext.rs` において `url` キーをパースし、`HeadlineInfo.url` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:111` `let url = map`
- `src-tauri/src/commands/ext.rs:112` `.get("url")`
- `src-tauri/src/commands/ext.rs:129` `url,`
- `src-tauri/src/commands/web.rs:14` `if let Some(pos) = uri.find("url=") {`
- `src-tauri/src/commands/web.rs:19` `.emit("ukagaka-install-url", decoded.to_string())`
