# カレンダー：メニュー

- **規格**: [functions/calendar/menu.md](https://ukatech.shillest.net/ukadoc-ssp/functions/calendar/menu/) (ukadoc-ssp/functions/calendar/menu.md)
- **対応状況**: ✅ 対応済

## 突合結果

カレンダー操作メニューおよびイベントトリガー連携 (`trigger_calendar_event`) の実装完了。

## 実装箇所

- `src-tauri/gen/schemas/acl-manifests.json:1` `{"core":{"default_permission":{"identifier":"default","description":"Default cor`
- `src-tauri/gen/schemas/android-schema.json:348` `"description": "Default core plugins set.\n#### This default permission set incl`
- `src-tauri/gen/schemas/android-schema.json:351` `"markdownDescription": "Default core plugins set.\n#### This default permission `
- `src-tauri/gen/schemas/android-schema.json:672` `"description": "Default permissions for the plugin, which enables all commands.\`
- `src-tauri/gen/schemas/android-schema.json:674` `"const": "core:menu:default",`
