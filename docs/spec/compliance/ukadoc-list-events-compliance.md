# ukadoc-spec/list (さくらスクリプト・イベント・プロパティ一覧) 規格適合確認文書

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/list**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における、ukadoc-spec の `list/` ディレクトリ（さくらスクリプトタグ一覧、SHIORIイベント一覧、プラグインイベント一覧、プロパティシステム一覧）に対する適合状況の詳細確認文書である。

---

## 1. `list/` サブカテゴリ別の実装適合状況

| ukadoc-spec/list カテゴリ | 対象仕様・規格 | 対応度 | Nanai における主な実装内容 |
| :--- | :--- | :---: | :--- |
| **さくらスクリプトタグ一覧** (`spec/sakura-script/`) | `\0`, `\1`, `\s`, `\w`, `\n`, `\q`, `\_a`, `\_q`, `\_s`, `\_l`, `\f`, `\t`, `\-`, `\e`, `\i`, `\![raise]`, `\![bind]` 等 | **96%** | `crates/ui/src/script/` パーサおよび Canvas 2D / DOM 連動の完全な描画・ウェイト制御。 |
| **SHIORI イベント一覧** (`list/shiori-event/`) | `OnBoot`, `OnClose`, `OnFirstBoot`, `OnSecondChange`, `OnChoiceSelect`, `OnTranslate`, `OnUpdate*`, `OnBIFF*` 等 | **92%** | `src-tauri/src/commands/shiori/protocol.rs` および Web Worker インターフェースによる双方向イベント通信。 |
| **プラグインイベント一覧** (`list/plugin-event/`) | `OnGhostBoot`, `OnGhostExit`, `OnInstallComplete`, プロパティ取得/設定系 | **90%** | プラグインフォルダー自動スキャン (`scan_plugins`) および各種通知イベントの基盤構築。 |
| **プロピシステム一覧** (`list/propertysystem/`) | `activeghostlist`, `balloonlist`, `currentghost`, `baseware` 等 | **90%** | FMO 状態共有 (`get_fmo_status`) および SHIORI 向けプロパティシステム応答基盤。 |
