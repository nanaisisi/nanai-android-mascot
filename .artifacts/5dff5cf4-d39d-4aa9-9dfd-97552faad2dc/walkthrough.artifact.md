# ウォークスルー - SSP/伺かネイティブ互換リソース管理アーキテクチャの適正化

ご指摘いただいたアーキテクチャ上の問題点（Webアプリ的なCSSへのテーマハードコードの排除、デフォルトソリッドボーダーの完全分離、および人工的な文字数上限なしの動的スコープ管理）を完全に解消・適正化いたしました。

## 変更概要

### 1. CSSのボーダー定義の適正化 ([balloon-window.css](ui/css/balloon-window.css))

- `.balloon` のベーススタイルからハードコードされたソリッドボーダー（`border: ...`）の規定を完全に削除。
- 画像ベースのスキンが純粋に `border-image` と `descript.txt` アセットのみで描画されるように整理。

### 2. 動的マルチキャラクター・スコープ管理の非ハードコード化 ([preload.rs](src-tauri/src/commands/window/balloon_window/preload.rs), [position.rs](src-tauri/src/commands/window/balloon_window/position.rs))

- 人為的な上限（99等）や固定スコープを廃止し、ゴーストの `descript.txt` からパースされたキャラクター数・スコープ範囲（`0` 〜 `N`）に基づいて完全に動的にウィンドウキャッシュと位置同期を実行。

### 3. バルーン動的ロードおよびフォールバック機構 ([theme.ts](ui/ts/ghost/balloon-window/theme.ts))

- 指定されたバルーンスキンのマニフェストおよびアセット取得が失敗した場合のみ、自動的にビルトイン標準バルーン（`nam_default_plus`）へシームレスにフォールバック。

### 4. CSS スタイルの完全中立化 ([balloon-theme.css](ui/css/balloon-theme.css))

- 静的なテーマ別スタイル定義を完全に削除し、すべてランタイムの `descript.txt` 解析結果と CSS 変数による動的インジェクションへ完全移行。

## 検証結果

- **自動テスト**: `npx vitest run`（155テストファイル・576テストすべて合格）
- **Rust ビルド**: `cargo check --manifest-path src-tauri/Cargo.toml`（正常終了）
