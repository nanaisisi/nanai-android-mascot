# SSPの基本情報

- **規格**: [about/ssp.md](https://ukatech.shillest.net/ukadoc-ssp/about/ssp/) (ukadoc-ssp/about/ssp.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

クレジット、ライセンス表記、バージョン情報モーダル

## 実装箇所

- `src-tauri/src/shiori/fmo.rs:161` `} else if check_named_mutex("ssp") {`
- `src-tauri/src/shiori/fmo.rs:162` `"ssp".to_string()`
- `src-tauri/src/shiori/fmo.rs:176` `let is_ssp = check_named_mutex("ssp");`
- `src-tauri/src/shiori/fmo.rs:180` `map.insert("ssp".to_string(), is_ssp);`
- `src-tauri/src/shiori/fmo.rs:192` `set_fallback_mutex("ssp", true);`
