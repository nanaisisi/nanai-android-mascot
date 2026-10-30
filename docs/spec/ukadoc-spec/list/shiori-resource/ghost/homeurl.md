# homeurl

- **規格**: [homeurl.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/homeurl/) (ukadoc-spec/list/shiori-resource/ghost/homeurl.md)
- **検索語**: homeurl
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

update/network.rs で homeurl を取得してネットワーク更新に使用。

## 実装箇所

- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:44` `.or_else(|| map.get("homeurl").cloned());`
- `src-tauri/src/commands/ext.rs:101` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:109` `.or_else(|| map.get("homeurl").cloned());`
- `src-tauri/src/commands/shell/balloon.rs:107` `/// [charset,文字コード], [type,種別], [craftman,作者名], [craftmanw,作者名], [craftmanurl,UR`
