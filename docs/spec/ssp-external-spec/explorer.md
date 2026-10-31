# エクスプローラ機能仕様

- **規格**: [ukadoc-ssp/functions/explorer](https://github.com/ukatech/ukadoc-ssp/blob/main/functions/explorer/index.md)
- **対応状況**: ✅ 対応済 (基本項目・ゴースト依存日時・ステータス判定)

## 目的

インストール済みゴーストを表形式で確認し、名前・作者名・パス・`\0` 名・`\1` 名を見ながら対象を切り替える。SSP のエクスプローラを既存のモーダル UI 上に実装する。

## デザインの管轄仕様

- **UIデザインと配色の管轄**: エクスプローラウィンドウ（および各種モーダル、メニュー）の外観デザイン、テーブルレイアウト、配色スキーム（ダークテーマ・アクセントカラー等）は、SSP本体のネイティブデザインに依存するものではなく、**本アプリケーション（Nanai Android Mascot）側の管轄**である。
- **デザイン方針**: アプリケーション全体のバルーンデザインシステムやモーダルテーマ（CSS変数）に完全に準拠し、マルチプラットフォーム（デスクトップ・Android等）で視認性と操作性に優れたモダンなデザインを提供する。

## 一覧項目とデータ仕様

| 列               | データ                    | 対応 | 備考                                                         |
| ---------------- | ------------------------- | ---- | ------------------------------------------------------------ |
| 名前             | `GhostInfo.name`          | ✅   | `descript.txt` の `name`                                     |
| 作者名           | `GhostInfo.craftman`      | ✅   | `craftman` プロパティ                                        |
| パス             | `GhostInfo.path`          | ✅   | インストールディレクトリ絶対パス                             |
| グループ         | `GhostInfo.group`         | ✅   | グループ定義                                                 |
| インストール日時 | `GhostInfo.install_date`  | ✅   | ディレクトリ作成/初回修正日時                                |
| 更新日時         | `GhostInfo.update_date`   | ✅   | **ゴースト依存**: `updates2.dau` / `descript.txt` の更新日時 |
| 更新結果         | `GhostInfo.update_result` | ✅   | `OK(0)`, `-` (etc) 等のステータス                            |
| `¥0名`           | `GhostInfo.sakura_name`   | ✅   | `sakura.name`                                                |
| `¥1名`           | `GhostInfo.kero_name`     | ✅   | `kero.name`                                                  |

### 1. 更新日時 (`update_date`) のゴースト依存ロジック

ゴーストの更新日時はホスト側のフォルダ変更日時ではなく、ゴースト固有のファイル変更に依存して決定される：
1. ゴースト内の `updates2.dau`（ネットワーク更新ファイル一覧）のファイル修正日時を最優先で参照。
2. `updates2.dau` がない場合は、`ghost/master/descript.txt`（ゴースト設定ファイル）のファイル修正日時を参照。
3. いずれもない場合は、ゴーストディレクトリ自体の修正日時にフォールバック。

### 2. 更新結果 (`update_result`) ステータス定義

SSP / ネットワーク更新仕様に準拠したステータスコードおよび表現を使用：
- `OK(0)`: 正常・準備完了（`updates2.dau` 検出等）
- `OK(2)` / `OK(4)` / `OK(5)`: 各種成功・更新完了コード
- `NG(timeout)`: ネットワークタイムアウト
- `NG(404)`: 対象ファイル不存在（404 Not Found）
- `-`: 未実施・その他（etc）

### 3. Win32 GUI標準に基づくSSP非明示仕様 (カラムソートインジケータ)

- **ソート方向の可視化**: SSP（Win32ベースのネイティブダイアログ/エクスプローラ）の慣例に倣い、現在ソート対象となっているカラムヘッダーには昇順・降順を表すインジケータ（`▲` / `▼`）を表示し、ユーザーが現在の並び順を視覚的に識別できるようにする。

## 実装済み操作

- エクスプローラを「機能・ツール」サブメニューから開く
- 現在のゴーストを初期選択
- 行クリックによる選択
- 行ダブルクリックまたは「切り替え」によるゴースト切替
- 名前・作者名・パスの検索
- 検索結果の次候補への移動
- 列見出しの昇順・降順ソート（Win32準拠の昇順/降順インジケータ付帯）
- 再読み込み
- 閉じる

## 未対応・今後の拡張

- `group`、インストール日時、最終更新日時、更新結果の永続化 DB
- 種類メニューによるバルーン・シェル・プラグイン一覧への切替
- 複数選択（Ctrl/Shift）
- 右クリック機能メニュー、コピー、全選択
- 起動時にエクスプローラを自動表示する設定

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:179` `pub fn on_update_result_explorer(status: &str, log_path: Option<&str>) -> Self {`
- `ui/menu-iframe.html:135` `<button type="button" class="menu-item" id="explorer-btn" data-action="explorer"`
- `ui/css/menu-modal.css:197` `.explorer-toolbar {`
- `ui/css/menu-modal.css:204` `.explorer-toolbar input[type="search"] {`
- `ui/css/menu-modal.css:219` `.explorer-toolbar input[type="search"]:focus {`
