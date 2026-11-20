# craftmanurl,URL

- **規格**: [craftmanurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/headline/descript-txt/) (ukadoc-spec/descript/headline/descript-txt/craftmanurl.md)
- **検索語**: craftmanurl
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/ext.rs` において `craftmanurl` キーのパースおよび `HeadlineInfo.craftman_url` への設定が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:193` `self.get("craftmanurl")`
- `src-tauri/src/commands/ext.rs:42` `.get("craftmanurl")`
- `crates/ui/src/descript/tests.rs:16` `desc.craftmanurl().map(|s| s.as_str()),`
- `src-tauri/src/commands/ext.rs:107` `.get("craftmanurl")`
- `crates/ui/src/descript/tests.rs:67` `craftmanurl,https://author.url\n\`
- `src-tauri/src/commands/install/archive/postprocess.rs:123` `.and_then(|m| m.get("craftmanurl").cloned());`
