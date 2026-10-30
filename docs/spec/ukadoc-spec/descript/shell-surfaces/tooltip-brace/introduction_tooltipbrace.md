# tooltipブレス記述例

- **規格**: [introduction_tooltipbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/tooltip-brace/introduction_tooltipbrace/) (ukadoc-spec/descript/shell-surfaces/tooltip-brace/introduction_tooltipbrace.md)
- **検索語**: tooltip
- **対応状況**: ✅ 対応済 (surface-load.js)\n\n## 突合結果\n\nui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。\n\n## 実装箇所

- `src-tauri/gen/schemas/acl-manifests.json:1` `{"core":{"default_permission":{"identifier":"default","description":"Default cor`
- `src-tauri/gen/schemas/android-schema.json:1062` `"description": "Default permissions for the plugin, which enables all commands.\`
- `src-tauri/gen/schemas/android-schema.json:1065` `"markdownDescription": "Default permissions for the plugin, which enables all co`
- `src-tauri/gen/schemas/android-schema.json:1128` `"description": "Enables the set_tooltip command without any pre-configured scope`
- `src-tauri/gen/schemas/android-schema.json:1130` `"const": "core:tray:allow-set-tooltip",`
