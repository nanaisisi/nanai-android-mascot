# Nanai Android Mascot

> **AI 関与について**: このドキュメントは GitHub Copilot / Antigravity の支援により作成・更新されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。粗製です。

デスクトップマスコット規格「**伺か（UKAGAKA）**」のAndroid向け互換環境を提供する、Tauri v2 + Rust 製のクロスプラットフォーム・アプリケーションです。

## 重要参考情報

> [!NOTE]
> **Android環境の既存の伺か互換ベースウェア**:  
> Android デバイス上で既存の伺か互換ベースウェアをお探しの方は、**[pono-droid](https://github.com/ukagaka-irono/pono-droid)**, **[UKA-droid - 「伺か」互換マスコットアプリ](https://play.google.com/store/apps/details?id=com.hiro.ukadroid)** も合わせてご参照ください。

---

## 注意事項

本ソフトウェアは開発段階であり、いかなる環境でも十分に動作しない段階です。

## 🌟 主な特徴(目標と現実)

- 🤖 **AI 駆動開発** - GitHub Copilot / Antigravity との緊密な協調による設計・実装
- 📱 **クロスプラットフォーム** - Android OS向け互換ベースウェアとして、Windows デスクトップ検証（Windows First）から段階的に Android 環境へ適応
- 🔧 **Tauri v2 + Rust + TypeScript / WASM** - 軽量・省メモリ・高速起動と、TypeScript / Vite / HTML5 Canvas / CSS3 および Rust WASM（`wasm-pack`）による高い拡張性を両立
- 🛡️ **SHIORI 実行環境 & 動的モジュール戦略**:
  - **同梱版（標準方針: 静的同梱 Static Linking）**: 定番 SHIORI（`cpp/satoriya-shiori`, `cpp/yaya-shiori`, `cpp/kawari`）の C++ ソースを Cargo `cc` / NDK で直接バイナリへ静的リンク（`dlopen()` 不要で確実・LTO により最速）。Windows 環境では既存 DLL 互換検証用の動的ロード（`libloading` / 32bit ホスト `shiori-host32`）も提供。
  - **配信ルート別の動的拡張 & WebView (V8) WASM**: Google Play 版の **Dynamic Feature Modules (DFM)** オンデマンド配信や、GitHub / 野良 APK 版の外部 `.so` サイドローディングに対応。また Rust 側の重い `wasmi` インタープリタ依存を通常ビルドから削除・オプショナル化し、WASM 実行は WebView (Chromium V8) の JIT 付き標準 `WebAssembly.instantiate` に一本化することでバイナリ軽量化と省メモリ化（800MB メモリ膨張対策・二重保持/二重ランタイム排除）を実現。
- 👻 **SSP風ゴースト情報**: メニューの「情報」から、現在のゴーストの名前・バージョン・作者・SHIORI・キャラクター名・インストール先を確認できます。処理中バナーにも対象ゴーストの `descript.txt` に記載された `version` を表示します。

---

## 🛠️ 技術構成

- **バックエンド / ワークスペース**: Rust 2024, Tauri v2 (`src-tauri`), ドメイン分割クレート群 (`crates/nanai-core`, `nanai-surface`, `nanai-shiori-vm`, `nanai-vfs`, `ui`), `encoding_rs`, C++ (`cpp/` 配下 SHIORI 静的リンク & Windows 32bit/64bit DLL ローダー `shiori-host32`) ※`wasmi` は通常ビルドから削除・オプショナル化方針
- **フロントエンド / WebView (V8) & WASM コア**: TypeScript, Vite, HTML5 Canvas 2D, CSS3, WebView (V8) 標準 `WebAssembly.instantiate`, `wasm-pack` (`wasm-bindgen` / `tsify`) による `nanai-core` WASM バインディング (`ui/ts/core/wasm/pkg`)
- **ゴーストデータ**: 公式モックキャラクター `mock_nanai` 同梱（`assets/ghost/mock_nanai`）

---

## 🚀 クイックスタート

### 開発環境のセットアップ

- [Rust](https://www.rust-lang.org/) (最新 stable) / ターゲット: `wasm32-unknown-unknown`（Windows 32bit SHIORI DLL 対応時は `i686-pc-windows-msvc` も追加）
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)
- [Node.js](https://nodejs.org/) (LTS 版)
- [VS Code](https://code.visualstudio.com/) または [Antigravity IDE](https://antigravity.google/)
- 推奨拡張機能: `rust-analyzer`, `Tauri`

### ビルド & 実行 (Windows)

初回のみ `npm install` を実行してください。`cargo tauri dev` / `cargo tauri build` は `npm run build:wasm`（`wasm-pack build crates/nanai-core --target web --out-dir ui/ts/core/wasm/pkg --dev`）と Vite ビルドを自動実行します。`cargo run` から実行ファイルに引数を渡すために、`--` が2個必要です。

```bash
# アプリのログを警告・エラーだけに制限 / 完全に抑制
cargo tauri dev -- -- --log-level=warn
cargo tauri dev -- -- --quiet

# 開発モード起動 / リリースビルド
cargo tauri dev
cargo tauri build

# WASM 単体ビルド / フロントエンドテスト
npm run build:wasm
npm test

# カバレッジテスト
with-env { RUSTC_WRAPPER: "", CARGO_UNSTABLE_CODEGEN_BACKEND: "true", CARGO_PROFILE_DEV_CODEGEN_BACKEND: "llvm" } { cargo llvm-cov --summary-only }
```

ログレベルには `off`、`error`、`warn`、`info`、`debug`、`trace` を指定できます。
`cargo run --quiet` は Cargo の出力だけを抑制します。アプリへ渡す場合は
`cargo run -- --quiet` のように `--` の後ろへ指定してください。

### ゴーストのネットワーク更新 (Windows)

メニューの「ネットワーク更新」、または `U` キーから、現在のゴーストに設定された
`homeurl` を使って更新できます。更新情報は `updates2.dau` を優先し、取得できない
場合は `updates.txt` にフォールバックします。各ファイルは定義された MD5 と照合して
からゴーストの実フォルダーへ保存されます。

更新元のゴーストには、`ghost/master/descript.txt` またはルートの `descript.txt` に
HTTP(S) の `homeurl` と、更新対象を記載した `updates2.dau` / `updates.txt` が必要です。
更新チェックのみを行う場合はメニューの「更新確認」を使用できます。更新処理中は
`OnUpdateBegin`、`OnUpdateReady`、`OnUpdateComplete` / `OnUpdateFailure` などの
SHIORI イベントも通知されます。

### ビルド & 実行 (Android)

```bash
# デバッグビルド (aarch64)
cargo tauri android build -d -t aarch64

# 実機実行
cargo tauri android run
```

---

## 📚 ドキュメント

プロジェクトの詳細な技術仕様書、設計書、ユーザーガイドは [`docs/`](docs/README.md) ディレクトリに体系的にまとめられています。

- **[ドキュメント総合案内](docs/README.md)**
- **[ユーザーガイド](docs/doc/user/user-guide.md)**
- **[インストール手順](docs/doc/user/installation.md)**
- **[システムアーキテクチャ](docs/doc/developer/architecture.md)**
- **[WASM モジュール設計](docs/doc/architecture/wasm-module-architecture.md)**
- **[SHIORI 実行環境・動的モジュール配信方針](docs/doc/architecture/shiori-runtime-and-dynamic-module-policy.md)**
- **[開発アプローチ](docs/doc/process/development-approach.md)**
- **[技術仕様書一覧](docs/spec/)**

---

## 🔗 関連リンク・参考コミュニティ

- **技術コミュニティ・公式仕様リポジトリ**:
  - [Ukagaka Tech Team (ukatech)](https://ukatech.shillest.net/) - 伺か周辺ツール・SHIORI を保守・開発するコミュニティ
  - [ukadoc-spec (GitHub)](https://github.com/ukatech/ukadoc-spec) - UKADOC 公式伺か仕様リポジトリ（プロトコル、さくらスクリプト等）
  - [ukadoc-ssp (GitHub)](https://github.com/ukatech/ukadoc-ssp) - SSP 固有仕様・拡張機能リファレンス
  - [SSP 公式サイト (BUGFIX)](http://ssp.shillest.net/) - Windows 向け代表的伺かベースウェア
- **SHIORI 系ドキュメント・仕様リポジトリ**:
  - [YAYA Docs (GitHub: YAYA-shiori/yaya-docs)](https://github.com/YAYA-shiori/yaya-docs) - YAYA 公式マニュアル・仕様リポジトリ（Unlicense / パブリックドメイン）
  - [SATORI Docs (GitHub: ukatech/satori-docs)](https://github.com/ukatech/satori-docs) - 里々（SATORI）公式マニュアル・仕様リポジトリ（里々開発チーム / ukatech）
  - [KAWARI (GitHub: ukatech/kawari)](https://github.com/ukatech/kawari) - 華和梨（KAWARI）公式エンジン・マニュアル・リポジトリ（華和梨開発チーム / ukatech）
- **Android 既存互換ベースウェア**:
  - [Ukadroid（伺か for Android）](https://play.google.com/store/apps/details?id=com.hiro.ukadroid) - Google Play にて配信中の Android 向け互換ベースウェア

---

## 📄 ライセンス & クレジット

### 1. 本ソフトウェア本体 (Nanai Android Mascot)

本プロジェクトのオリジナルコードおよびリポジトリ成果物は、以下のデュアルライセンスのもとで公開されています。利用者の要件に応じていずれかのライセンスを選択可能です。

- [Apache License, Version 2.0](LICENSE-APACHE)
- [MIT License](LICENSE-MIT)

---

### 2. 伺か仕様書・公式ドキュメントリファレンス

本ソフトウェアの互換実装にあたり、コミュニティ有志によって策定・保守されている以下の仕様書・公式ドキュメントを広く参照・準拠しています。長年にわたり規格を整備・公開してこられた各執筆者・開発チームの皆様に深く感謝いたします。

- **伺か標準仕様 / SSP 拡張仕様**:
  - **リポジトリ**: [ukatech/ukadoc-spec](https://github.com/ukatech/ukadoc-spec) / [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp)
  - **プロジェクト**: [UKADOC project](https://ukatech.shillest.net/ukadoc-spec/)
  - **ライセンス**: [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.ja)
  - **クレジット**: UKADOC project / Ukagaka Tech Team (ukatech)
- **YAYA 公式マニュアル・仕様書**:
  - **リポジトリ**: [YAYA-shiori/yaya-docs](https://github.com/YAYA-shiori/yaya-docs)
  - **公開サイト**: [YAYA マニュアル (GitHub Pages)](https://yaya-shiori.github.io/yaya-docs/)
  - **ライセンス**: [The Unlicense](https://github.com/YAYA-shiori/yaya-docs/blob/main/LICENSE)（パブリックドメイン）
  - **特記事項**: `other/` と `tips/` には旧 [AYAYA Wiki](https://emily.shillest.net/ayayaold/) から転載したページが含まれ、匿名を含む多数の編集者の協力により作成されています。
- **里々（SATORI）公式マニュアル・仕様書**:
  - **リポジトリ**: [ukatech/satori-docs](https://github.com/ukatech/satori-docs)
  - **公開サイト**: [里々マニュアル (GitHub Pages)](https://ukatech.shillest.net/satori-docs/)
  - **ライセンス**: [BSD 2-Clause License](https://github.com/ukatech/satori-docs/blob/main/LICENSE)（里々本体 [satoriya-shiori](https://github.com/ukatech/satoriya-shiori) と同一）
  - **著作権表示**:
    - Copyright (c) 2001-2005, Kusigahama Yagi.
    - Copyright (c) 2006-, SEIBIHAN.
- **華和梨（KAWARI）公式マニュアル・仕様書**:
  - **リポジトリ**: [ukatech/kawari-docs](https://github.com/ukatech/kawari-docs)
  - **公開サイト**: [華和梨マニュアル (GitHub Pages)](https://ukatech.shillest.net/kawari-docs/)
  - **ライセンス**: [BSD 2-Clause License](https://github.com/ukatech/kawari-docs/blob/main/LICENSE)（華和梨本体 [kawari](https://github.com/ukatech/kawari) と同一）
  - **著作権表示**:
    - Copyright (c) 2001-2015, KAWARI Development Team

---

### 3. SHIORI サブシステム & 外部連携エンジン（同梱・再配布）

本プロジェクトで実行・連携対象とする各種 SHIORI エンジンおよび関連バイナリ・ライブラリの著作権は、それぞれの原著作者および開発元コミュニティに帰属します。

バイナリやソースコードを本リポジトリまたは配布パッケージに同梱・組み込み利用する場合は、各ソフトウェアのライセンス条項に則り、以下の著作権表示および許諾条件を厳格に維持・遵守します。

- **里々（SATORI）本体・同梱 SAORI (ssu)**:
  - **著作権**: Copyright (c) 2001-2005, Kusigahama Yagi. / Copyright (c) 2006-, SEIBIHAN.
  - **ライセンス**: [BSD 2-Clause License](https://opensource.org/licenses/BSD-2-Clause)
  - **遵守事項**: ソースコードまたはバイナリの再配布時に上記の著作権表示、条件リスト、および免責条項を維持すること。
- **YAYA (yaya-shiori)**:
  - **著作権**: Copyright (c) 2007-, 整備班 (SEIBIHAN) All rights reserved.
  - **ライセンス**: 修正 BSD ライセンス ([BSD 3-Clause License](https://opensource.org/licenses/BSD-3-Clause))
  - **遵守事項**: 再配布時に著作権表示、条件リスト、免責条項の維持、および書面による事前許可のない派生著作物の宣伝・推薦への無断利用禁止条項を遵守すること。
- **華和梨（KAWARI）**:
  - **著作権**: Copyright (c) 2001-2015, KAWARI Development Team (Meister (original works) / Nie / Nise-Meister / Sato / Shino / Suikyo) All rights reserved.
  - **ライセンス**: [BSD 2-Clause License](https://opensource.org/licenses/BSD-2-Clause)
  - **遵守事項**: ソースコードまたはバイナリの再配布時に上記の著作権表示、条件リスト、および免責条項を維持すること。
- **その他の外部モジュール / プラグイン**:
  - 将来的に同梱または動的連携する SHIORI・SAORI・プラグインについては、各配置ディレクトリ（`assets/` や専用ライブラリフォルダ）内にそれぞれの正規 `LICENSE` / `README` ファイルを同梱・配置し、各原著作者の権利表示を尊重します。

---

### 4. 同梱アセット & キャラクターデータ

- 本リポジトリにテスト用・動作検証用として同梱されている公式モックキャラクター（`mock_nanai` 等）および各種グラフィック・音声等のアセットは、本リポジトリのデュアルライセンス（Apache 2.0 / MIT）または同梱ディレクトリ内で明示された個別利用規定に従います。
- サードパーティ製のゴースト・シェル・バルーンデータをインポートして使用する場合の著作権および使用許諾条件は、各コンテンツの原著作者・制作者の配布規定に準拠します。
