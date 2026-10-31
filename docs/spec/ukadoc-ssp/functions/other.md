# その他の機能

- **規格**: [functions/other.md](https://ukatech.shillest.net/ukadoc-ssp/functions/other/) (ukadoc-ssp/functions/other.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

タスクトレイ格納（Android 常駐通知・スナップ退避）

## 実装箇所

- `src-tauri/gen/schemas/android-schema.json:2461` `"description": "Represents a list of other [`Value`]s.",`
- `src-tauri/gen/schemas/desktop-schema.json:2527` `"description": "Represents a list of other [`Value`]s.",`
- `src-tauri/gen/schemas/mobile-schema.json:2461` `"description": "Represents a list of other [`Value`]s.",`
- `src-tauri/gen/schemas/windows-schema.json:2527` `"description": "Represents a list of other [`Value`]s.",`
- `src-tauri/src/commands/config.rs:52` `(_, other) => {`
