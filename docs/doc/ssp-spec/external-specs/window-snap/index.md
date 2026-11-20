# SSP ウィンドウ・スナップ機能および位置リセット仕様 (Window Snap & Position Reset Specification)

- **規格**: [ukadoc-ssp/functions/window](https://ukatech.shillest.net/ukadoc-ssp/) / [SSP ショートカット一覧 (`functions/shortcut.md`)](../../../../ukadoc-ssp/functions/shortcut.md) / SSP デスクトップスナップ・ウインドウ配置規約
- **関連ドキュメント**: [`docs/spec/ukadoc-ssp/functions/shortcut.md`](../../../../spec/ukadoc-ssp/functions/shortcut.md) / [`platform-compliance.md`](../../../compliance/platform-compliance.md)
- **検索語**: `resetPosition` / `reset_character_positions` / `reset_balloon_positions` / `calculateWindowSnap` / `#coord-popup`
- **対応状況**: ✅ 対応済

## 仕様構成

- **[概要](./概要.md)**: タスクバー抜きのワークスペース基準 (`work_area`)、HiDPI スケールファクタの一貫した座標扱い、バルーン／シェル間の制御方針サマリ
- **[ボーダーコリジョンとスナップ仕様](./ボーダーコリジョンとスナップ仕様.md)**: バルーンの縦絶対クランプ・横無制限、シェルの境界無制限＆スナップシステム (`Monitor` / `Character` / `Initial`)、タイトルバーレス追随ポップアップ (`#coord-popup`) の2行フォーマット
- **[位置リセットとシェルバルーン初期化](./位置リセットとシェルバルーン初期化.md)**: `Ctrl+Shift+F12`（シェル位置初期化）・`Ctrl+Shift+F10`（バルーン位置初期化）、`work_area` 基準の初期配置、メニューおよびさくらスクリプト連携
- **[実装箇所](./実装箇所.md)**: バックエンド（Rust / Tauri コマンド）、フロントエンド（TypeScript / HTML / CSS）、ショートカット・メニュー連携の実装一覧
