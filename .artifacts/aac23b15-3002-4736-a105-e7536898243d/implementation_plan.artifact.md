# SHIORI 実行環境（プラットフォーム機能分岐・Android静的同梱）& 総合最適化 実装計画案

本計画案は、プラットフォームごとの適切な機能分岐（Cargo Feature）を導入し、**Android における主要 SHIORI エンジンの静的同梱（Static Linking）** と **Windows におけるシンプルな直接読み込み** を確立しつつ、メモリ消費・実行オーバーヘッドの総合最適化を達成するための実装計画です。

---

## 1. 背景と設計方針

SHIORI エンジンの実行基盤において、プラットフォーム特性に応じたシンプルな機能分岐構成を採用します。フォールバック処理や過剰な代替読み込み機構は持たせず、標準的で確実なビルド・実行パイプラインへ整理します。

### プラットフォーム別機能分岐仕様

1. **Windows (PC) 環境**:
   - 代替読み込みや特殊同梱メカニズムは不要。
   - 標準的な DLL / 共有ライブラリの直接ロード、または FFI 経由でのダイレクト呼び出しを採用。
2. **Android (モバイル) 環境**:
   - **標準構成として「静的同梱（Static Linking）」を採用**。
   - `build.rs`（`cc` クレート）経由で C++ ソース（里々 / YAYA / 華和梨）を直にバイナリへビルド組み込み。
   - W^X ポリシーや動的ロード制約を回避し、最高速かつ 100% 確実に動作する構成。

---

## 2. User Review Required (確定事項)

> [!NOTE]
>
> - **フォールバック不要**: 自動フォールバックや複雑な多重ローダーは実装せず、環境に応じたダイレクト呼び出しに一本化します。
> - **Cargo Feature による分離**: `windows` / `android-static-shiori` 等の機能フラグでプラットフォームごとのモジュールビルドを切り替えます。

---

## 3. 提案する変更内容 (Proposed Changes)

### Component 1: SHIORI 実行エンジン基盤 (`nanai-shiori-vm` & `nanai-core`)

#### [MODIFY] [Cargo.toml](crates/nanai-shiori-vm/Cargo.toml)

- プラットフォーム別の機能フラグ (`static-satori`, `static-yaya`, `static-kawari`, `win-dll`) を整理・追加。
- 不要な `wasmi` 依存をオプショナル化・削減。

#### [MODIFY] [build.rs](crates/nanai-shiori-vm/build.rs)

- Android / 静的同梱フラグ有効時、`cpp/` 配下の C++ SHIORI ソースを `cc` クレートでコンパイル・静的リンクするビルドロジックを確定。

#### [NEW] [dynamic_loader.rs](crates/nanai-shiori-vm/src/dynamic_loader.rs)

- 機能分岐（条件付きコンパイル `#[cfg(...)]`）に従い、Windows 向け直読み込みまたは Android 向け静的リンクシンボルを直接呼ぶ非同期 SHIORI 3.0 マネージャー。

---

### Component 2: Tauri バックエンド & トレイ・ライフサイクル (`crates/ui` / `src-tauri`)

#### [MODIFY] [shiori_bridge.rs](crates/ui/src/shiori/shiori_bridge.rs)

- UI (TS) からの SHIORI イベント要求を、プラットフォームビルドに応じた SHIORI エンジンへ直接ルーティング。

#### [MODIFY] [tray.rs](crates/ui/src/tray.rs)

- ゴースト読み込み・切り替え時にトレイアイコン (`tray.ico` / `tray.png`) およびツールチップ（ゴースト名）を動的に更新・リセット。

---

### Component 3: フロントエンド & メモリ最適化 (`ui/ts/` & `nanai-surface`)

#### [MODIFY] [ghost.ts](ui/ts/ghost/ghost.ts)

- ゴーストの `descript.txt` 設定に基づき、ダイレクトに SHIORI 呼び出しを発行。

#### [MODIFY] [surface_compositor.rs / cache](crates/nanai-surface/src/compositor.rs)

- `nanai-surface` での重なったサーフェス画像の合成結果に対し、LRU キャッシュ（上限 20MB）と Android `onTrimMemory` 時のキャッシュ解放を導入。

---

## 4. 検証計画 (Verification Plan)

### 自動テスト (Automated Tests)

- **Rust テスト**: `cargo test --all` (全 289 テストの通過、静的リンクバインディングのテスト)
- **TS / フロントエンド テスト**: `npm test` (全 570 テストの通過)

### 手動検証 (Manual Verification)

1. **Windows ビルド**: `cargo tauri dev` での直接読み込み & ゴースト対話確認。
2. **Android ビルド**: 静的同梱による C++ SHIORI エンジン動作確認およびパーミッション/メモリ制御の検証。
3. **トレイ・切替**: ゴースト切替時のアイコン・ツールチップ動的更新と SHIORI アンロード/ロード検証。
