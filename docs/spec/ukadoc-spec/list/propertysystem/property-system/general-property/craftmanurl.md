# craftmanurl

- **規格**: [craftmanurl.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/craftmanurl/)
- **検索語**: craftmanurl
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「craftmanurl」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:42` `.get("craftmanurl")`
- `src-tauri/src/commands/ext.rs:101` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:107` `.get("craftmanurl")`
- `src-tauri/src/commands/install/archive/postprocess.rs:58` `.and_then(|m| m.get("craftmanurl").cloned());`
