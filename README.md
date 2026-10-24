# Nanai Android Mascot

> **AI 関与について**: このドキュメントは GitHub Copilot / Antigravity の支援により作成・更新されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。

デスクトップマスコット規格「**伺か（UKAGAKA）**」の互換環境を提供する、Tauri v2 + Rust 製のクロスプラットフォーム・アプリケーションです。

## 🌐 伺かコミュニティ・エコシステム & 参考情報

本プロジェクトは、伺か技術の発展とオープンソースコミュニティの成果を尊重し、参考にしています。

> [!NOTE]
> **Ukagaka Tech Team (ukatech)**  
> 伺かのベースウェア周辺で利用される主要 SHIORI（YAYA, 里々, 華和梨）やツール類を現代向けに開発・保守している公式的な技術コミュニティです。  
> 🔗 **公式サイト**: [Ukagaka Tech Team (ukatech.shillest.net)](https://ukatech.shillest.net/)
>
> **Android 環境での互換ベースウェア**:  
> Android デバイス上で実績のある既存の伺か互換ベースウェアをお探しの方は、**[Ukadroid（伺か for Android）](https://play.google.com/store/apps/details?id=com.hiro.ukadroid)** も合わせてご参照ください。

---

## 🌟 主な特徴

- 🤖 **AI 駆動開発** - GitHub Copilot / Antigravity との緊密な協調による設計・実装
- 📱 **クロスプラットフォーム** - Windows デスクトップ検証（Windows First）から段階的に Android 環境へ適応
- 🔧 **Tauri v2 + Rust + Web 技術** - 軽量・省メモリ・高速起動と、Web 標準（HTML5/Canvas/CSS/Modern JS）による高い拡張性を両立
- 🎭 **高水準な伺か互換性** - さくらスクリプト、`surfaces.txt` 合成、当たり判定、標準クラシックメニュー、Shift_JIS 自動変換・VFS 対応
- 🛡️ **SHIORI 多層フォールバック** - ネイティブ DLL、WebAssembly（WASM）、内蔵辞書パーサー/モックの多層連携

---

## 🛠️ 技術構成

- **バックエンド**: Rust 2021, Tauri v2, `encoding_rs`
- **フロントエンド**: Vanilla HTML5, Canvas 2D, Modern JavaScript, CSS3
- **ゴーストデータ**: 公式モックキャラクター `mock_nanai` 同梱（`assets/ghost/mock_nanai`）

---

## 🚀 クイックスタート

### 開発環境のセットアップ

- [Rust](https://www.rust-lang.org/) (最新 stable)
- [Node.js](https://nodejs.org/) (LTS 版)
- [VS Code](https://code.visualstudio.com/) または [Antigravity IDE](https://antigravity.google/)
- 推奨拡張機能: `rust-analyzer`, `Tauri`

### ビルド & 実行 (Windows)

```bash
# 開発モード起動
cargo tauri dev

# リリースビルド
cargo tauri build
```

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
- **[ユーザーガイド](docs/user/user-guide.md)**
- **[インストール手順](docs/user/installation.md)**
- **[システムアーキテクチャ](docs/developer/architecture.md)**
- **[開発アプローチ](docs/process/development-approach.md)**
- **[技術仕様書一覧](docs/spec/)**

---

## 🔗 関連リンク・参考コミュニティ

- **技術コミュニティ**:
  - [Ukagaka Tech Team (ukatech)](https://ukatech.shillest.net/) - SHIORI（YAYA, 里々, 華和梨）やツール類を保守・公開するコミュニティ
  - [SSP 公式サイト (BUGFIX)](http://ssp.shillest.net/) - Windows 向け代表的伺かベースウェア
- **Android 既存互換ベースウェア**:
  - [Ukadroid（伺か for Android）](https://play.google.com/store/apps/details?id=com.hiro.ukadroid) - Google Play にて配信中の Android 向け互換ベースウェア

---

## 📄 ライセンス

本ソフトウェアは Apache License 2.0 または MIT License のデュアルライセンスの元で提供されています。
同梱されている外部 SHIORI や各アセットのライセンスについては、各ディレクトリ内のライセンスファイルを参照してください。
