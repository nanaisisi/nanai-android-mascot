# cursorブレス記述例

- **規格**: [introduction_cursorbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/introduction_cursorbrace/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/introduction_cursorbrace.md)
- **検索語**: cursor
- **対応状況**: ✅ 対応済 (surface-load.js)\n\n## 突合結果\n\nui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。\n\n## 実装箇所

- `src-tauri/gen/schemas/acl-manifests.json:1` `{"core":{"default_permission":{"identifier":"default","description":"Default cor`
- `src-tauri/gen/schemas/android-schema.json:1434` `"description": "Default permissions for the plugin.\n#### This default permissio`
- `src-tauri/gen/schemas/android-schema.json:1437` `"markdownDescription": "Default permissions for the plugin.\n#### This default p`
- `src-tauri/gen/schemas/android-schema.json:1476` `"description": "Enables the cursor_position command without any pre-configured s`
- `src-tauri/gen/schemas/android-schema.json:1478` `"const": "core:window:allow-cursor-position",`
