# menu.foreground.color,色

- **規格**: [menu.foreground.color.md](../../../../../ukadoc-spec/descript/shell/descript-txt/menu.foreground.color.md)
- **検索語**: menu.foreground.color
- **対応状況**: ⚠️ 一部対応

## 突合結果

未確認・未実装。


## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:33` `let fg_color = parse_color("menu.foreground.color").or_else(|| parse_color("menu`
- `ui/ts/ui/app-menu.ts:91` `foreground_color: manifestDescript["menu.foreground.color"] || "",`
- `ui/ts/ui/renderers/menu-theme-renderer.ts:42` `{ resource: "menu.foreground.color", field: "foreground_color" },`
