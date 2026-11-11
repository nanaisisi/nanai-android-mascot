# craftmanurl,URL

- **規格**: [craftmanurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/craftmanurl/) (ukadoc-spec/descript/shell/descript-txt/craftmanurl.md)
- **検索語**: craftmanurl
- **対応状況**: ⚠️ 一部対応

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/ext.rs:42` `.get("craftmanurl")`
- `src-tauri/src/commands/ext.rs:107` `.get("craftmanurl")`
- `src-tauri/src/commands/install/archive/postprocess.rs:106` `.and_then(|m| m.get("craftmanurl").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest.rs:90` `m.get("craftmanurl")`
- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs:9` `"craftmanurl" => "https://example.com/shiori".to_string(),`
