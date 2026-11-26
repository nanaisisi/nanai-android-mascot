# Project Rules (`nanai-android-mascot`)

## 1. Specification-First Workflow (`docs/`)

- ウィンドウ位置制御・スナップ・ショートカット・SSP 互換動作・Android オーバーレイ仕様を変更する場合は、実装前に `docs/doc/ssp-spec/` または `docs/doc/nam-spec/` 配下の該当仕様書を確認・更新する。
- `docs/` 更新時は `npm run verify:spec` を実行し、リンク切れ・未登録仕様・テーブル破損がないことを確認する。
- リポジトリ内の Markdown では相対パスのみを使用し、テーブル内 `<br>` およびインライン HTML タグを使用しない。

## 2. Window Bounds, Snap, and Follow Popup Invariants

### Workspace Basis & HiDPI

- 初期配置・リセット位置・ボーダー判定・モニタースナップの基準領域には、モニター全体（`monitor.position()` / `monitor.size()`）ではなく、OS タスクバー・Dock を除いたワークスペース（`monitor.work_area()`）を使用する。
- 論理座標と物理座標を扱う際は `scale_factor()` / `scaleFactor` を一貫して換算する。

### Balloon Window

- **ボーダーコリジョン**: 縦方向（`Y`）は `[work_y, work_y + work_h - height]` へ厳格にクランプし（高さが `work_h` 以上の場合は `work_y` 固定）、初期表示・リサイズ・キャラ追従同期・ドラッグ後オフセット保存の全経路で適用する。横方向（`X`）は制限しない。
- **タイトルバーレス追随ポップアップ（`#coord-popup`）**: 次の 2 行を表示する。
  - 1行目: `Offset: <x>,<y>`（例: `Offset: -84,80`）
  - 2行目: `Reset: Ctrl+Shift+F10`
- **ショートカット**: `Ctrl+Shift+F10` でバルーン位置初期化（`reset_balloon_positions`）を実行する。

### Shell (Character) Window

- **ボーダー制限**: 縦方向（`Y`）・横方向（`X`）ともに移動・配置の境界クランプは行わない（画面外・タスクバー領域を含む自由配置を許可。初期未設定時およびリセット時のみ `work_area()` 基準で初期座標を算出）。
- **スナップシステム**: `Initial`（初期/リセット座標）・`Monitor`（`work_area` 上下左右端）・`Character`（他キャラクターウィンドウ端）を X/Y 軸独立で判定し、`Ctrl` キー押下中はスナップを一時無効化する。
- **タイトルバーレス追随ポップアップ（`#coord-popup`）**: 次の 2 行を表示し、スナップしていない軸（`None`）は省略する。
  - 1行目: `<x>,<y>` + アクティブ軸のみ（例: `1363,842 (Snap X:Character)` / `1363,842 (Snap X:Monitor, Snap Y:Initial)` / `1363,842`）
  - 2行目: `Press Ctrl to disable`
- **ショートカット**: `Ctrl+Shift+F12` でシェル位置初期化（`reset_character_positions`）、`Ctrl+Shift+F10` でバルーン位置初期化を行う。

## 3. Drag Follow Performance Invariants

- ドラッグ中の `#coord-popup` 更新やキャラ移動に伴うバルーン追従（`sync_character_balloon`）には、固定周期の `setInterval` や未制御の `mousemove` ごとの IPC 送信を使わず、`requestAnimationFrame`（必要時は 16ms フォールバック）によるフレーム単位のコアレスを用いる。
- 前フレームと座標・スナップ・修飾キー状態が変わっていない場合は `#coord-popup` の DOM 書き換えをスキップし、IPC 呼び出しはインフライト制御を行う。ドラッグ終了・`blur`・`touchcancel` 時には必ずフレームループを解放する。

## 4. Verification & Platform Guardrails

- **Rust 検証 (Windows)**: この環境では `cargo test` バイナリ実行時に `0xc0000139`（DLL エントリポイント制約）で起動失敗するため、Rust テストのコンパイル検証には `cargo check --tests --manifest-path src-tauri/Cargo.toml` および `cargo fmt --check --manifest-path src-tauri/Cargo.toml` を用いる。
- **Rust 構造リンター**: Rust のモジュール構成・クレート間依存を変更した場合は `npm run lint:rust`（個別実行は `npm run lint:deslop` / `npm run lint:coupling`）を実行する。`cargo-coupling` は `.coupling.toml` に基づき Grade B+、Critical 0 / High 0 / 循環 0 を品質ゲートとし、`deslop-please` は既存負債を `.deslop-please.allow` で管理する（正当な理由なく `.deslop-please.allow` へ新規項目を追加しない）。
- **TS / CSS / 生成バインディング**: 変更した TS/CSS/テストファイル（生成・更新した `ui/bindings.ts` を含む）に対して `npx @biomejs/biome check` を実行し、整形・import 順エラーを残さない。
- **Android ネイティブ連携**: Rust 側コマンド（`src-tauri/src/commands/window/android.rs` 等）を追加した際、`MainActivity.kt` 等 Kotlin/Java 側のハンドラが未実装（スタブ状態）である場合は、未実装箇所と実機未検証である旨を明確に区別して扱う。
