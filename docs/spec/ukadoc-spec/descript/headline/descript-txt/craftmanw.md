# craftmanw,作者名

- **規格**: [craftmanw.md](https://ukatech.shillest.net/ukadoc-spec/descript/headline/descript-txt/) (ukadoc-spec/descript/headline/descript-txt/craftmanw.md)
- **検索語**: craftmanw
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/ext.rs` において `craftmanw` キーをパースし、`HeadlineInfo.craftman` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:40` `.or_else(|| map.get("craftmanw").cloned());`
- `src-tauri/src/commands/ext.rs:101` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:105` `.or_else(|| map.get("craftmanw").cloned());`
- `src-tauri/src/commands/shell/balloon.rs:157` `/// [charset,文字コード], [type,種別], [craftman,作者名], [craftmanw,作者名], [craftmanurl,UR`
