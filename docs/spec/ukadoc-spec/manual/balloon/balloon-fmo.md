# バルーン FMO 連携 (`balloon0`, `balloon1`)

- **規格**: [balloon-fmo.md](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/)
- **検索語**: balloon-fmo
- **対応状況**: ✅ 実装済
- **実装ファイル**:
  - [fmo.rs](../../../../src-tauri/src/fmo.rs) (`pub balloon0`, `pub balloon1`)

FMO（FMO/1.0）ステータス構造体における `balloon0` および `balloon1` プロパティへの現在表示中テキストの格納・同期処理。

## 実装箇所

- `src-tauri/src/fmo.rs:17` `pub balloon0: String,`
- `src-tauri/src/fmo.rs:86` `pub async fn update_fmo_balloon_text(`
- `ui/ts/core/actions/sstp-fmo-actions.ts:100` `export async function updateFmoBalloonText(`
