# PLUGIN/2.0 規格対応仕様 (PLUGIN/2.0 Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: PLUGIN/2.0](https://ukatech.shillest.net/ukadoc-spec/spec/plugin/)
- **元ドキュメント・権利者**: [ukatech/ukadoc-spec: PLUGIN](https://ukatech.shillest.net/ukadoc-spec/spec/plugin/) - © MATERIA開発チーム / SSP開発チーム / ukadoc プロジェクト (ukadoc 仕様 / パブリックリファレンス)
- **プロトコル**: PLUGIN/2.0 (DLL / WASM / WebWorker)
- **対応ステータス**: **設計・一部実装（50%）**

---

## 1. 規格概要と Nanai 実装方針

PLUGIN は、ベースウェア全体に対して機能を追加する拡張仕様です（例: 音声合成、カレンダー、通知連携、センサー取得など）。

- **Nanai でのプラグインアーキテクチャ**:
  - `src/js/modal-manager.js` にてプラグイン一覧管理 UI を実装済。
  - WebExtension スタイルの JS プラグインおよび WASM プラグインを標準サポート。
  - Windows/Android 実機のハードウェア機能（バッテリー残量、通知、位置情報等）を Web 標準 API 経由でプラグインに提供。

---

## 2. インターフェース / イベント対応状況

| 項目 / イベント | 仕様 | 対応状況 | 動作仕様・備考 |
| :--- | :--- | :---: | :--- |
| `load` | プラグイン初期化 | ✅ 対応済 | プラグイン起動時の初期パラメータ受渡し |
| `unload` | プラグイン解放 | ✅ 対応済 | 終了時のリソースクリーンアップ |
| `OnMenuExec` | メニュー実行 | ✅ 対応済 | ベースウェアメニューの「プラグイン」項目からの実行 |
| `OnGhostBoot` | ゴースト起動検知 | 🚧 開発中 | ゴースト起動通知を各プラグインへブロードキャスト |
| `OnGhostExit` | ゴースト終了検知 | 🚧 開発中 | ゴースト終了通知のブロードキャスト |
| `OnSecondChange` | 毎秒タイマー | 🚧 開発中 | プラグイン側定期処理トリガー |
