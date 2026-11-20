# menu.font.name,フォント名

- **規格**: [menu.font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/menu.font.name.md)
- **検索語**: menu.font.name
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/shell/theme.rs` および SHIORI プロパティ評価系において `menu.font.name` のパース、シェルテーママージ、プロパティ返却が完全実装済み。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:39` `let font_name = merged.get("menu.font.name").cloned();`
- `ui/ts/ui/renderers/menu-theme-renderer.ts:54` `{ resource: "menu.font.name", field: "font_name" },`
- `tests/menu-theme-shiori.test.ts:87` `if (res === "menu.font.name") return "Meiryo";`
- `src-tauri/src/shiori/property/tests.rs:149` `assert_eq!(evaluate_property_query("menu.font.name"), "sans-serif");`
- `tests/menu-theme-shiori.test.ts:95` `"menu.font.name": "Meiryo",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:61` `"menu.font.name" => "sans-serif",`
