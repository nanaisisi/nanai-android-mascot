# SHIORI 規格対応仕様 (SHIORI Compliance)

- **元ドキュメント・権利者**: [ukatech/ukadoc-spec: SHIORI/3.0 & SHIORI/2.x](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © MATERIA開発チーム / 里々開発チーム / YAYA開発チーム / 華和梨開発チーム / ukadoc プロジェクト (ukadoc 仕様 / 各コミュニティライセンス)
Nanai Android Mascot における「SHIORI プロトコル」およびイベント通信規格への個別対応仕様です。

## 1. 概要と対応度

- **プロトコル規格**: SHIORI/3.0（および SHIORI/2.x エミュレーション）
- **対応度**: **85%**
- **主要実装ファイル**:
  - `src/js/shiori-protocol.js`: SHIORI 3.0 リクエスト/レスポンスパーサー
  - `src/js/shiori-worker.js`: 非同期 Web Worker サンドボックス実行環境
  - `src/js/ghost.js`: イベントパイプライン・キューイング制御

---

## 2. プロトコル対応詳細

| 項目 / 規格 | 対象仕様 | 対応状況 | 実装詳細・動作仕様 |
| :--- | :--- | :---: | :--- |
| **SHIORI 3.0 プロトコル** | `GET Version SHIORI/3.0`, `GET SHIORI/3.0` | ✅ 対応済 | リクエストヘッダ（ID, Sender, Reference0..n）の構築とレスポンス（200 OK, 204 No Content, Value）の完全パース |
| **SHIORI 2.x プロトコル** | `GET Sentence SHIORI/2.x` 等 | ⚠️ フォールバック | SHIORI 3.0 ラッパー経由、または標準JS SHIORIによるエミュレート |
| **Web Worker 実行** | 非同期サンドボックス実行 | ✅ 対応済 | UIスレッドをブロックしない Web Worker 内での非同期 SHIORI 実行 |
| **C/C++ SHIORI (里々/YAYA)** | DLLネイティブ実行 | 🚧 開発中 | WebAssembly (WASM) コンパイルによるブラウザ/Worker内実行を計画 |

---

## 3. イベント対応詳細

| イベント名 | トリガー条件 | 対応状況 | パラメータ (Reference) / 備考 |
| :--- | :--- | :---: | :--- |
| `OnBoot` | ゴースト起動時 | ✅ 対応済 | Reference0: 起動シェル名。初回トークの再生 |
| `OnClose` | 終了操作時 | ✅ 対応済 | Reference0: 終了理由。終了トーク完了後にウィンドウ破棄 |
| `OnFirstBoot` | 初回インストール起動時 | ✅ 対応済 | 初回専用トークの再生 |
| `OnGhostChanged` | ゴースト切り替え時 | ✅ 対応済 | 切り替え元・先ゴースト名の受渡し |
| `OnShellChanged` | シェル着せ替え時 | ✅ 対応済 | 新シェル名の受渡し |
| `OnMouseClick` | キャラクタータップ/クリック | ✅ 対応済 | Reference0: X, Reference1: Y, Reference3: キャラID(\0 or \1), Reference4: 部位名(head, bust等) |
| `OnMouseDoubleClick` | ダブルタップ/ダブルクリック | ✅ 対応済 | 同上 |
| `OnSecondChange` | 毎秒タイマー | ✅ 対応済 | ランダムトーク頻度計算、待機モーション制御 |
| `OnMinuteChange` | 毎分タイマー | ✅ 対応済 | 時報トーク、バックグラウンド処理 |
| `OnChoiceSelect` | さくらスクリプト `\q` 選択時 | ✅ 対応済 | Reference0: 選択肢ID, Reference1: 選択肢テキスト |
| `OnUpdate` | ネットワーク更新実行時 | 🚧 一部対応 | メニューからの発火および進行状況通知 |
| `OnBIFF` | メールチェック実行時 | 🚧 計画中 | POP3 着信確認シミュレーション |
