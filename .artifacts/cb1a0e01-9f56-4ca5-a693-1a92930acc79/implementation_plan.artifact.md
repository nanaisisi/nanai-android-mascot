# SSP挙動分析に基づくシステムトレイとゴーストライフサイクルの連携計画

SSP（Sakura Script Player）の挙動分析に基づき、システムトレイ（タスクトレイ）を現在読み込まれているゴーストのライフサイクル（ロード・切替・アンロード・プロパティ）へ密接に紐づける機能拡張計画。

---

## 1. SSP のシステムトレイ挙動分析

1. **トレイアイコンおよびツールチップの動的同期**:
   - ゴーストのロード時（`OnBoot` / `load_ghost`）に、ゴーストフォルダ内の `tray.ico` または `tray.png` を自動検出してトレイアイコンを更新。
   - トレイアイコンのツールチップテキストを、現在アクティブなゴースト名（`sakura.name` / `ghost.name`）へ動的に更新。
2. **ゴースト切替・アンロード連動**:
   - ゴースト切替（`selectGhost`）時に新ゴーストのアイコンへ即座にトレイアイコン・ツールチップを差し替え。
   - すべてのゴーストがアンロードされた場合、デフォルトのアプリ用トレイアイコン（`32x32.png` / `icon.ico`）および「Nanai Android Mascot」ツールチップに復元。
3. **トレイコンテキストメニューの動的構造同期**:
   - トレイアイコンのコンテキストメニューから、現在ロードされているゴーストの操作（トーク呼び出し、ゴースト切替、シェル切替、設定、終了）が正しく行えるよう連携。

---

## 2. 提案する実装変更

### A. Rust バックエンド (`src-tauri/src/tray.rs`, `load.rs`, `close.rs`)
- **`update_tray_for_ghost(app_handle, ghost_name, ghost_master_dir)`**:
  - ゴーストロード時にトレイアイコン (`tray.ico` / `tray.png`) とツールチップ (`ghost_name`) を一括同期更新。
- **`reset_tray_to_default(app_handle)`**:
  - 全ゴーストアンロード時にトレイアイコンとツールチップをデフォルトへ復元。

### B. フロントエンド / イベント連携 (`ui/ts/ghost/ghost.ts`)
- ゴースト読み込み・切り替えイベント発生時、Tauri コマンド経由でトレイアイコンおよびツールチップ更新を発火。

---

## User Review Required

> [!IMPORTANT]
> 既存の全テスト（TS 570件・Rust 289件）のカバレッジを維持したまま、SSP 互換のトレイ連動機能を安全に組み込みます。

---

## Verification Plan

### Automated Tests
- `cargo test --package nanai-android-mascot-ui` (全 289 テスト通過)
- `npm test` (全 154 テストファイル / 570 テスト通過)

### Manual Verification
- `cargo run` / `cargo tauri dev` での起動・ゴースト読み込み時のトレイアイコンおよびツールチップ（`Emily/Phase4.5`等）の動的変化確認。
