# SHIORI/3.0 規格対応仕様 (SHIORI/3.0 Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: SHIORI/3.0](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/)
- **プロトコル**: SHIORI/3.0 (テキストベース HTTPライク通信)
- **対応ステータス**: **対応済（85%）**

---

## 1. 規格概要と Nanai 実装方針

SHIORI/3.0 は、ベースウェア（Nanai Android Mascot）とゴーストの思考AI・頭脳（SHIORI モジュール）の間で交わされる基本通信規格です。

- **実装モジュール**: `src/js/shiori-protocol.js`, `src/js/shiori-worker.js`
- **アーキテクチャ**:
  - Web Worker によるサンドボックス非同期実行（UIメインスレッドのブロック防止）。
  - 標準 JS SHIORI / Mock SHIORI 連携完備。
  - C/C++ ネイティブ DLL 型 SHIORI は WebAssembly (WASM) フォールバックにて対応。

---

## 2. コマンド対応状況

| コマンド | 仕様 | 対応状況 | 動作仕様・備考 |
| :--- | :--- | :---: | :--- |
| `GET Version SHIORI/3.0` | バージョン取得 | ✅ 対応済 | SHIORI モジュールの初期ハンドシェイク、バージョンおよび名前取得 |
| `GET SHIORI/3.0` | イベント通知・トーク要求 | ✅ 対応済 | 各種イベント（ID, Reference0..n 等）の送信とレスポンス（Value）の取得 |
| `NOTIFY SHIORI/3.0` | 戻り値不要の通知 | ✅ 対応済 | 時間変化通知やステータス通知に使用 |

---

## 3. リクエスト / レスポンスヘッダ

| ヘッダ | 種別 | 対応状況 | 備考 |
| :--- | :--- | :---: | :--- |
| `Sender` | Request | ✅ 対応済 | クライアント名（`Nanai`）を設定 |
| `ID` | Request | ✅ 対応済 | イベント名（`OnBoot`, `OnMouseClick` 等）を指定 |
| `Reference0` .. `n` | Request | ✅ 対応済 | 各イベントに応じた可変引数の格納 |
| `Charset` | Both | ✅ 対応済 | UTF-8 / Shift_JIS の自動透過ハンドリング |
| `Value` | Response | ✅ 対応済 | さくらスクリプト文字列等の戻り値取得 |
| `Status` (200 / 204 / 400等) | Response | ✅ 対応済 | 200 (OK: 発言あり), 204 (No Content: スキップ), エラーハンドリング |
