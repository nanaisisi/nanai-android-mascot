# craftmanw,作者名

- **規格**: [craftmanw.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/craftmanw.md)
- **検索語**: craftmanw
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「craftmanw」を確認。


## 実装箇所

- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:37` `let craftman = map.get("craftman").cloned().or_else(|| map.get("craftmanw").clon`
- `src-tauri/src/commands/ext.rs:95` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:96` `let craftman = map.get("craftman").cloned().or_else(|| map.get("craftmanw").clon`
- `src-tauri/src/commands/shell/balloon.rs:107` `/// [charset,文字コード], [type,種別], [craftman,作者名], [craftmanw,作者名], [craftmanurl,UR`
