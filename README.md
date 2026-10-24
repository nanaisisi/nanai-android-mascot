# Nanai Android Mascot

> **AI 関与について**: このドキュメントは GitHub Copilot / Antigravity の支援により作成・更新されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。

デスクトップマスコット規格「**伺か（UKAGAKA）**」の互換環境を提供する、Tauri v2 + Rust 製のクロスプラットフォーム・アプリケーションです。

## 📱 Android 版 公式推奨アプリのご案内

> [!TIP]
> <table>
>   <tr>
>     <td><img src="https://play-lh.googleusercontent.com/I5w2u5p-Wp26yU2a_q5a2M2A8VdO5tM" width="64" alt="Ukadroid" onerror="this.style.display='none'"/></td>
>     <td>
>       <strong>Ukadroid (伺か for Android)</strong><br />
>       Android 上で手軽にゴーストと触れ合いたい方は、実績豊富な公式推奨アプリ <strong>Ukadroid</strong> をぜひご利用ください！<br />
>       👉 <a href="https://play.google.com/store/apps/details?id=com.hiro.ukadroid"><strong>Google Play で今すぐダウンロード</strong></a>
>     </td>
>   </tr>
> </table>

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

## アプリ (UKAGAKA for Android)

Android デバイス上で今すぐ快適に「伺か」ゴーストを楽しみたい方には、アプリ **Ukadroid** のご利用をおすすめします。

<p align="center">
  <a href="https://play.google.com/store/apps/details?id=com.hiro.ukadroid">
    <img src="https://img.shields.io/badge/Google_Play-Ukadroid-34A853?style=for-the-badge&logo=googleplay&logoColor=white" alt="Get it on Google Play" height="42" />
  </a>
</p>

- **アプリ名**: Ukadroid（伺か for Android）
- **入手先**: [Google Play ストア](https://play.google.com/store/apps/details?id=com.hiro.ukadroid)
- **概要**: Android 上で動作する伺か互換ベースウェア。

---

## 📄 ライセンス

本ソフトウェアは Apache License 2.0 または MIT License のデュアルライセンスの元で提供されています。
同梱されている外部 SHIORI や各アセットのライセンスについては、各ディレクトリ内のライセンスファイルを参照してください。
