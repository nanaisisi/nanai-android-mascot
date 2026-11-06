# 損なわない範囲での安全なリファクタリング計画

既存の機能やテスト（フロントエンド 570 件・Rust 289 件）を一切損なうことなく、コードベースの美化、重複コードの排除、およびモジュール構造の整理を行う安全なリファクタリング計画。

## User Review Required

> [!IMPORTANT]
> 外部仕様・UI挙動・テストケースの変更は行わず、内部構造のクリーンアップと保守性の向上に特化します。

## Proposed Changes

### 1. Rust バックエンド (Workspace / `crates/*`)
- 各モジュールクレート（`nanai-core`, `nanai-surface`, `nanai-shiori-vm`, `nanai-vfs`）および `src-tauri` における未使用の警告やデッドコードの最終整理。
- モジュール間のインポートパスの整理と可視性（`pub` / `pub(crate)`）の適正化。

### 2. フロントエンド (TypeScript / `ui/ts/*`)
- UI描画やイベントハンドラー周辺における重複コードの共通化。
- 未使用の変数・インポートの削除。

## Verification Plan

### Automated Tests
- `cargo test --package nanai-android-mascot-ui` (全 289 テストの成功確認)
- `npm test` (全 154 テストファイル / 570 テストの成功確認)
