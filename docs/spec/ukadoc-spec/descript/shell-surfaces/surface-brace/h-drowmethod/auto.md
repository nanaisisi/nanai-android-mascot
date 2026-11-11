# auto

- **規格**: [auto.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/auto/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/auto.md)
- **検索語**: auto
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `src-tauri/src/commands/shell/manifest.rs:123` `DrawMethod::Auto => "auto".to_string(),`
- `src-tauri/src/shiori/property/tests.rs:123` `assert_eq!(evaluate_property_query("sakura.menu"), "auto");`
- `src-tauri/src/shiori/property/tests.rs:124` `assert_eq!(evaluate_property_query("kero.menu"), "auto");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:74` `"sakura.menu" | "kero.menu" => "auto",`
- `crates/nanai-core/src/update_protocol.rs:8` `pub const UPDATE_REASONS: &[&str] = &["manual", "auto", "script"];`
