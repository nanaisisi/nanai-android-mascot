# SSP/伺かネイティブ互換リソース管理アーキテクチャの適正化計画

本計画は、Webアプリ的なハードコードを排除し、SSP（伺か）のネイティブデスクトップ仕様に完全に準拠したゴースト・バルーン・キャラクターの動的ロードおよび管理システムへのリファクタリングを定義します。

## ユーザーレビュー Required

> [!IMPORTANT]
> 「最大99キャラクターまで対応」といった人為的な上限・キャップを設けること自体がSSPの仕様（任意の整数スコープを動的に扱う仕組み）に反しています。ゴーストの `descript.txt` から解析されるキャラクター数・スコープ範囲（`0` 〜 `N`）を、ハードコードされた上限なしに完全に動的かつスケーラブルに取り扱うアーキテクチャへと適正化します。

## Proposed Changes

### 1. バルーン動的ロードおよびフォールバック機構の強化

- **[MODIFY] [theme.ts](ui/ts/ghost/balloon-window/theme.ts)**
  - 指定されたバルーンスキンのマニフェスト（`balloon_manifest`）およびアセット取得が失敗した場合のみ、自動的にビルトイン標準バルーン（`nam_default_plus`）へシームレスにフォールバック。
  - ウィンドウサイズを画像自然寸法（`dims.width`, `dims.height`）に連動させ、ネイティブウィンドウのリサイズ（`getCurrentWindow().setSize`）を確実に実行。
- **[MODIFY] [balloon-window.css](ui/css/balloon-window.css)**
  - `.balloon` からソリッドボーダー等のハードコードされたデフォルトボーダー定義を一切排除し、純粋なコンテナスタイル（パレット・スクロール・ライティングモード等）のみに純化。すべての枠線・背景描画は `border-image` と `descript.txt` のみに依存する構造へ修正。

### 2. 動的マルチキャラクター管理の完全非ハードコード化

- **[MODIFY] [preload.rs](src-tauri/src/commands/window/balloon_window/preload.rs)**
- **[MODIFY] [position.rs](src-tauri/src/commands/window/balloon_window/position.rs)**
  - 固定のスコープ数や人為的な上限（99等）を完全に廃止し、ゴーストの `descript.txt` から動的に解析されたキャラクター数・スコープ範囲（`0` 〜 `N`）に基づいてウィンドウキャッシュと位置同期を実行。

### 3. CSS スタイルの完全中立化

- **[MODIFY] [balloon-theme.css](ui/css/balloon-theme.css)**
  - 静的なテーマ別スタイル定義（`emily4`、`ivory` 等）を完全に削除し、すべてランタイムの `descript.txt` 解析結果と CSS 変数による動的インジェクションへ完全移行。

## Verification Plan

### 自動テスト

- `npx vitest run`（155テストファイル・576テストの完全通過確認）
- `cargo check --manifest-path src-tauri/Cargo.toml`（Rustバックエンドのコンパイル確認）

### 手動検証

- カスタムバルーン（`emily4` 等）および標準バルーンのインポート・表示・サイズ適正化およびフォールバック動作、人工的な上限（99等）に依存せず動的スコープが正しく機能することの確認。
