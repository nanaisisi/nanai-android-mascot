# SSPの基本情報

- **規格**: [about/ssp.md](https://ukatech.shillest.net/ukadoc-ssp/about/ssp/) (ukadoc-ssp/about/ssp.md)
- **対応状況**: ✅ 実装済

## 突合結果

クレジット、ライセンス表記、バージョン情報モーダル

## 実装箇所

- `crates/ui/src/fmo/types.rs:4` `pub const MUTEX_SSP: &str = "ssp";`
- `src-tauri/src/shiori/fmo.rs:161` `} else if check_named_mutex("ssp") {`
- `ui/menu-iframe.html:17` `<!-- ssp-menu-exact-spec.md 準拠：Scope 0 (メイン) 及び Scope >= 1 (サブ) メニュー構造 -->`
- `tests/e2e-dialogue-flow.test.ts:4` `import "./e2e/ssp-dialogs.test.js";`
- `crates/ui/src/fmo/tests/buffer_processing.rs:12` `path: "D:\\ssp\\".to_string(),`
- `src-tauri/src/shiori/fmo.rs:162` `"ssp".to_string()`
