# auto

- **規格**: [auto.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/auto/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/auto.md)
- **検索語**: auto
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-core/src/update_protocol.rs:13` `pub const UPDATE_REASONS: &[&str] = &["manual", "auto", "script"];`
- `src-tauri/src/commands/shell/manifest.rs:123` `DrawMethod::Auto => "auto".to_string(),`
- `ui/assets/LICENSE-3RD-PARTY.html:28` `margin: 0 auto;`
- `ui/test-menu.html:36` `overflow-y: auto;`
- `tests/install-update-protocol.test.ts:114` `expect(normalizeUpdateReason("Auto")).toBe("auto");`
- `crates/nanai-core/src/update_protocol.rs:53` `} else if trimmed.eq_ignore_ascii_case("auto") {`
