# %property\[プロパティ名\]

- **規格**: [pct-property.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-property/) (ukadoc-spec/list/sakura-script/environment-variable/pct-property.md)
- **検索語**: property
- **対応状況**: ✅ 実装済

## 突合結果

プロパティシステム評価エンジン (`src-tauri/src/shiori/property.rs` -> `evaluate_property_query`) にてプロパティ照会・取得処理を実装済。

## 実装箇所

- `crates/nanai-core/src/sakura_script.rs:32` `Font { property: String, args: Vec<String> },`
- `src-tauri/src/lib.rs:206` `shiori::property::get_system_property,`
- `ui/assets/LICENSE-3RD-PARTY.html:9352` `(a) under intellectual property rights (other than patent or trademark)`
- `ui/ts/ui/submenu-theme.ts:34` `const setOrRemove = (property: string, value: unknown) => {`
- `tests/balloon-cycle6-typography.test.ts:8` `it("sets writing mode property correctly for vertical: 1 and resets properly", (`
- `crates/nanai-core/src/sakura_script.rs:145` `let property = parts.first().cloned().unwrap_or_default();`
