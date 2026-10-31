# keroname

- **規格**: [keroname.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/keroname/)
- **検索語**: keroname
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「keroname」を確認。

## 実装箇所

- `src-tauri/src/shiori/fmo.rs:13` `pub keroname: String,`
- `src-tauri/src/shiori/fmo.rs:34` `content.push_str(&format!("{}.keroname\x01{}\r\n", prefix, rec.keroname));`
- `src-tauri/src/shiori/fmo.rs:68` `keroname: "Kero".to_string(),`
- `crates/ui/src/script/env.rs:11` `keroname: &str,`
- `crates/ui/src/script/env.rs:31` `result = result.replace("%keroname", keroname);`
