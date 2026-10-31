# エクスプローラ機能仕様 (Explorer Specification)

- **規格**: [ukadoc-ssp/functions/explorer](https://github.com/ukatech/ukadoc-ssp/blob/main/functions/explorer/index.md)
- **検索語**: get_fmo_status
- **対応状況**: ✅ 対応済

## 目的

インストール済みゴーストを表形式で確認し、名前・作者名・パス・`\0` 名・`\1` 名を見ながら対象を切り替える。SSP のエクスプローラを既存のモーダル UI 上に実装する。

## デザインの管轄仕様

- **UIデザインと配色の管轄**: エクスプローラウィンドウ（および各種モーダル、メニュー）の外観デザイン、テーブルレイアウト、配色スキーム（ダークテーマ・アクセントカラー等）は、本アプリケーション（Nanai Android Mascot）側の管轄である。

## 一覧項目とデータ仕様

| 列 | データ | 対応 | 備考 |
|---|---|---|---|
| 名前 | `GhostInfo.name` | ✅ | `descript.txt` の `name` |
| 作者名 | `GhostInfo.craftman` | ✅ | `craftman` プロパティ |
| パス | `GhostInfo.path` | ✅ | インストールディレクトリ絶対パス |
| インストール日時 | `GhostInfo.install_date` | ✅ | ディレクトリ作成/初回修正日時 |
| 更新日時 | `GhostInfo.update_date` | ✅ | **ゴースト依存**: `updates2.dau` / `descript.txt` |
| 更新結果 | `GhostInfo.update_result` | ✅ | `OK(0)` 等のステータス |
| `¥0名` | `GhostInfo.sakura_name` | ✅ | `sakura.name` |
| `¥1名` | `GhostInfo.kero_name` | ✅ | `kero.name` |

## 実装箇所

- `src-tauri/src/fmo.rs:27` `pub async fn get_fmo_status(state: tauri::State<'_, AppState>) -> Result<String,`
- `src-tauri/src/lib.rs:161` `fmo::get_fmo_status,`
- `src-tauri/src/shiori/fmo.rs:150` `pub async fn get_fmo_status() -> Result<FmoStatus, String> {`
