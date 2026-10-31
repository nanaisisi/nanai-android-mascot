# craftmanw

- **規格**: [craftmanw.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/craftmanw/)
- **検索語**: craftmanw
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「craftmanw」を確認。

## 実装箇所

- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:40` `.or_else(|| map.get("craftmanw").cloned());`
- `src-tauri/src/commands/ext.rs:101` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:105` `.or_else(|| map.get("craftmanw").cloned());`
- `src-tauri/src/commands/shell/balloon.rs:185` `/// [charset,文字コード], [type,種別], [craftman,作者名], [craftmanw,作者名], [craftmanurl,UR`
