# menu.background.color,色

- **規格**: [menu.background.color.md](../../../../../ukadoc-spec/descript/shell/descript-txt/menu.background.color.md)
- **検索語**: menu.background.color
- **対応状況**: ✅ 実装済

## 突合結果

未確認・未実装。


## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:32` `let bg_color = parse_color("menu.background.color").or_else(|| parse_color("menu`
- `ui/ts/ui/app-menu.ts:90` `background_color: manifestDescript["menu.background.color"] || "",`
- `tests/menu-theme-shiori.test.ts:48` `"menu.background.color": "#222222",`
- `ui/ts/ui/renderers/menu-theme-renderer.ts:41` `{ resource: "menu.background.color", field: "background_color" },`
- `tests/menu-theme-shiori.test.ts:72` `"menu.background.color": "rgb(40, 50, 60)",`
- `tests/menu-theme-shiori.test.ts:86` `if (res === "menu.background.color") return "rgb(1, 2, 3)";`
