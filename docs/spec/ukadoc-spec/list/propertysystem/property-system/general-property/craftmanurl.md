# craftmanurl

- **規格**: [craftmanurl.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/craftmanurl/)
- **検索語**: craftmanurl
- **対応状況**: ⚠️ 一部対応

## 突合結果

ヒットしたのは一般的な語「craftmanurl」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/ext.rs:42` `.get("craftmanurl")`
- `src-tauri/src/commands/ext.rs:107` `.get("craftmanurl")`
- `src-tauri/src/commands/install/archive/postprocess.rs:106` `.and_then(|m| m.get("craftmanurl").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest.rs:90` `m.get("craftmanurl")`
- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs:9` `"craftmanurl" => "https://example.com/shiori".to_string(),`
