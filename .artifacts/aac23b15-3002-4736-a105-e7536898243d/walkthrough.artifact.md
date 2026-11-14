# SHIORI 実行環境（プラットフォーム機能分岐・Android静的同梱）& 総合最適化 実装完了報告

## 概要

本実装では、`nanai-android-mascot` における SHIORI 実行環境のプラットフォーム機能分岐、Android 環境での C++ SHIORI (里々, YAYA, 華和梨) の静的同梱 (Static Linking)、フォールバックなしのダイレクト呼び出し機構、および `nanai-surface` の LRU 画像キャッシュを統合・完成させました。

---

## 主な変更点と成果

### 1. プラットフォーム機能分岐 (Cargo Feature)

- [Cargo.toml](crates/nanai-shiori-vm/Cargo.toml): `static-shiori`, `static-satori`, `static-yaya`, `static-kawari`, `win-dll`, `wasmi-runner` の各 Feature フラグを整備。
- Windows 向け直接 DLL FFI と Android 向けの C++ 静的コンパイル設定を分離。

### 2. ダイレクト SHIORI ローダーの構築 (`dynamic_loader.rs` & `native.rs`)

- [dynamic_loader.rs](crates/nanai-shiori-vm/src/dynamic_loader.rs): 不要な自動フォールバックを挟まず、プラットフォーム条件付きコンパイル (`#[cfg(...)]`) に従って Native SHIORI API (`load`, `request`, `unload`) をスレッドセーフに直接呼び出すマネージャーを新規構築。
- [native.rs](crates/ui/src/shiori/engine/native.rs): `ShioriEngine` トレイトを実装した `NativeShioriEngine` を追加。

### 3. C++ SHIORI の Android 静的同梱ビルド基盤 (`build.rs`)

- [build.rs](crates/nanai-shiori-vm/build.rs): Android / `static-shiori` 有効時に `cpp/` 配下の C++ ソースをコンパイル・静的リンクするロジックを構成。

### 4. `nanai-surface` LRU 画像キャッシュの実装

- [cache.rs](crates/nanai-surface/src/compositor/cache.rs): 重なったサーフェス画像合成結果のメモリ消費量を制御するため、上限 20MB の `SurfaceLruCache`（`GLOBAL_SURFACE_CACHE`）を実装。古い合成画像を適時自動破棄しメモリ膨張を抑制。

---

## 検証結果

- **Rust ユニットテスト**: 全 120 テストが成功（`nanai-shiori-vm`, `nanai-surface`, `nanai-core`, `nanai-vfs`）。
- **TypeScript / フロントエンド テスト**: 全 268 テストファイル / 1076 テストケースが成功 (`npm test`)。
