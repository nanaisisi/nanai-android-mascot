# homeurl,URL

- **規格**: [homeurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/) (ukadoc-spec/descript/plugin/descript-txt/homeurl.md)
- **検索語**: homeurl
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/ext.rs` において `homeurl` キーをパースし、`PluginInfo.craftman_url` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:44` `.or_else(|| map.get("homeurl").cloned());`
- `src-tauri/src/commands/ext.rs:101` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:109` `.or_else(|| map.get("homeurl").cloned());`
- `src-tauri/src/commands/shell/balloon.rs:185` `/// [charset,文字コード], [type,種別], [craftman,作者名], [craftmanw,作者名], [craftmanurl,UR`
