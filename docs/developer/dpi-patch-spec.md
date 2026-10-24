> **AI 関与について**: このドキュメントは AI アシスタントの支援により作成されました。
> 関連コミット: `0c34f2d` (ローカルパッチ導入), `96f769a` (Rust 2024 / 最新依存対応)

# dpi クレート改変仕様・記録書 (patches/dpi)

## 1. 概要と本質的な導入背景（なぜローカルパッチ化したのか）

Nanai Android Mascot では、Tauri v2 (`tauri-runtime`, `tao`, `wry`, `muda` 等) のウィンドウ制御およびマルチプラットフォーム UI スケーリング（高 DPI ディスプレイ・Android ディスプレイメトリクス）において、Rust-windowing グループの [`dpi`](https://crates.io/crates/dpi) クレート（v0.1.2）に依存しています。

本プロジェクトのルート [`Cargo.toml`](file:///e:/project/rust/nanai-android-mascot/Cargo.toml) では、`[patch.crates-io]` ディレクティブにより crates.io の `dpi` をローカルの [`patches/dpi`](file:///e:/project/rust/nanai-android-mascot/patches/dpi) で上書き（オーバーライド）しています。

```toml
# e:/project/rust/nanai-android-mascot/Cargo.toml
[patch.crates-io]
dpi = { path = "patches/dpi" }
```

### 1.1 本題：crates.io 版のままだとビルドエラー／バグが発生する原因

アップストリーム（crates.io の原本 `Cargo.toml.orig`）の `dpi 0.1.2` は、本来 **winit のマルチクレートリポジトリ（workspace）内でビルドされる前提** で設計されています：

```toml
# dpi 0.1.2 の Cargo.toml.orig より
[package]
edition.workspace = true
repository.workspace = true
rust-version.workspace = true

[dependencies]
mint = { workspace = true, optional = true }
serde = { workspace = true, optional = true }
```

crates.io への公開時に正規化（normalization）されたファイルは生成されているものの、スタンドアロンや本プロジェクトのワークスペース（Rust 2024 / ナイトリーツールチェーン環境、Android ターゲットクロスコンパイル環境）に取り込んだ際、以下の問題を引き起こします：

1. **ワークスペース / エディション不整合によるビルドクラッシュ・警告**:
   - 本プロジェクトはワークスペース全体で `edition = "2024"`（Rust 1.101.0-nightly）を採用。
   - crates.io の正規化版に残る `edition = "2021"` や `rust-version = "1.73"` 制約が、最新コンパイラ機能やワークスペース解決（resolver = "2"）と衝突し、ビルドエラー・警告の原因となる。
2. **Android ターゲット (aarch64 等) クロスコンパイル時の libm / 依存不整合**:
   - `dpi` は `libm` による数学関数の自己実装と `std` 機能の切り替えを行っており、Android ターゲットや WebAssembly ビルド時に外部クレート（`mint`, `serde`）の依存バージョンが古いと型解決やフィーチャー解決で不整合を起こす。
3. **ベンダー固定化による即時トラブルシュート**:
   - Tauri v2 のウィンドウ／WebView 座標系（物理ピクセル `PhysicalPosition/Size` と論理ピクセル `LogicalPosition/Size`）の変換ロジックをプロジェクト直下（`patches/dpi`）に抱え込むことで、Android 画面密度や透過キャンバスの座標計算で予期せぬ挙動が発生した場合に、即座に修正・検証・パッチ適用できるようにする。

---

## 2. 依存関係ツリーでの位置づけ

```text
dpi v0.1.2 (patches/dpi)
├── muda v0.20.0 (トレイメニュー / コンテキストメニュー座標系)
├── tao v0.37.2 (ウィンドウ作成 / イベントループ / HiDPI スケールファクター計算)
├── tauri-runtime v2.12.2 (ウィンドウ・ディスプレイサイズ抽象化)
└── wry v0.57.1 (WebView の物理ピクセル / 論理ピクセル変換)
```

---

## 3. 具体的な改変内容の詳細 (Diff Analysis)

ローカルパッチディレクトリ [`patches/dpi`](file:///e:/project/rust/nanai-android-mascot/patches/dpi) は、アップストリーム `dpi 0.1.2` のソースコード (`src/lib.rs`, `src/libm.rs`) をベースに、[`Cargo.toml`](file:///e:/project/rust/nanai-android-mascot/patches/dpi/Cargo.toml) のビルド定義をプロジェクト要件に合わせてカスタマイズしています。

### 3.1 主な変更点一覧

| 項目 | 変更前 (crates.io / 原本) | 改変後 (`patches/dpi/Cargo.toml`) | 目的・理由 |
| :--- | :--- | :--- | :--- |
| **Rust Edition** | `edition = "2021"` | `edition = "2024"` | Rust 1.101.0-nightly / 2024 エディション環境への適合・ビルドエラー防止 |
| **MSRV 制約** | `rust-version = "1.73"` | *(削除)* | ナイトリーおよび最新ツールチェーン環境下での過度なバージョン縛りの解除 |
| **`mint` 依存** | `0.5.6` | `0.5.9` | 3D 数学 / ベクトル相互運用ライブラリの最新パッチバージョン対応 |
| **`serde` 依存** | `1` | `1.0.229` (features: `serde_derive`) | シリアライズ・デシリアライズ依存バージョンのピン留め・整合性確保 |
| **Cargo 構文整形** | 改行配列展開 | インライン配列 (`keywords`, `features` 等) | Cargo マニフェストの可読性とメンテナンス性の向上 |

### 3.2 マニフェスト差分 (`patches/dpi/Cargo.toml`)

```diff
 [package]
-edition = "2021"
-rust-version = "1.73"
+edition = "2024"
 name = "dpi"
 version = "0.1.2"
 build = false
@@ -22,24 +21,14 @@ autotests = false
 autobenches = false
 description = "Types for handling UI scaling"
 readme = "README.md"
-keywords = [
-    "DPI",
-    "HiDPI",
-    "scale-factor",
-]
+keywords = ["DPI", "HiDPI", "scale-factor"]
 categories = ["gui"]
 license = "Apache-2.0 AND MIT"
 repository = "https://github.com/rust-windowing/winit"
 
 [package.metadata.docs.rs]
-features = [
-    "mint",
-    "serde",
-]
-rustdoc-args = [
-    "--cfg",
-    "docsrs",
-]
+features = ["mint", "serde"]
+rustdoc-args = ["--cfg", "docsrs"]
 targets = [
     "i686-pc-windows-msvc",
     "x86_64-pc-windows-msvc",
@@ -63,10 +52,10 @@ name = "dpi"
 path = "src/lib.rs"
 
 [dependencies.mint]
-version = "0.5.6"
+version = "0.5.9"
 optional = true
 
 [dependencies.serde]
-version = "1"
+version = "1.0.229"
 features = ["serde_derive"]
 optional = true
```

---

## 4. プロジェクトへの影響と検証

1. **コンパイル検証**:
   - `cargo check` および `cargo check --workspace` で問題なくビルドが通過することを確認済み。
2. **Tauri v2 エコシステムとの整合性**:
   - `tao` / `wry` が要求する `LogicalPosition`, `PhysicalPosition`, `LogicalSize`, `PhysicalSize` 等の型シグネチャをそのまま保持しており、API 破壊を起こさずにコンパイラ・依存関係の近代化（Rust 2024 Edition 対応）を達成しています。
3. **Android 移植時**:
   - Android の画面密度 (DPI / dp) からサーフィス座標・バルーン描画座標へ換算する際のコア型として、引き続き安定して機能します。

---

## 5. 運用ルール・保守指針

- アップストリーム側（`winit` / `dpi`）で大きな更新があった場合は、`Cargo.toml.orig` を基準に差分を再評価します。
- `cargo update` 実行時も `[patch.crates-io]` によりローカルパッチが常に優先適用されます。
