# FMO 状態管理

- **規格**: [fmo-status.md](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/)
- **検索語**: fmo-status
- **対応状況**: ✅ 実装済

ゴーストの起動状態・スコープ座標・サーフィス情報を管理する FMO（FMO/1.0）構造体の更新・同期処理を実装。

## 実装箇所

- `src-tauri/src/fmo.rs:27` `pub async fn get_fmo_status(state: tauri::State<'_, AppState>) -> Result<String,`
- `src-tauri/src/fmo.rs:135` `pub async fn update_fmo_surfaces(`
- `src-tauri/src/fmo.rs:184` `pub async fn update_fmo_lifecycle_state(`
- `ui/ts/core/actions/sstp-fmo-actions.ts:80` `export async function getFmoStatus(): Promise<FmoSystemStatus>`
- `ui/ts/core/actions/sstp-fmo-actions.ts:121` `export async function updateFmoSurfaces(`
