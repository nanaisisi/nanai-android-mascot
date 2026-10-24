> **AI 関与について**: このドキュメントは GitHub Copilot / Antigravity の支援により作成・更新されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。

# ソフトウェア概要プロンプト - nanai_android_mascot

## 1. 概要

本ソフトウェア **nanai-android-mascot** は、デスクトップマスコット規格である「伺か（UKAGAKA / SSP）」の互換環境を提供するクロスプラットフォーム・アプリケーションです。
かつて存在したスマートフォン向けマスコット環境の代替・現代的再興を主目的とし、まずはデスクトップ（Windows）環境で堅牢な互換コアを実証した上で、段階的に Android 環境へと移植・最適化する「Windows First 開発アプローチ」を採用しています。

---

## 2. コア技術スタック

- **アプリケーション基盤**: [Tauri v2](https://v2.tauri.app/) + [Rust](https://www.rust-lang.org/)
- **フロントエンド / UI**: HTML5 + Vanilla Modern JavaScript + CSS3
  - フレームワーク依存を排し、軽量性、起動速度、WebView 透過描画制御、およびコミュニティによる拡張性を最大化
- **ウィンドウ・描画制御**:
  - ウィンドウ透過表示（Transparent Window）、ドラッグ移動、クリック透過（Pointer Events 制御）
  - HTML5 Canvas 2D による `surfaces.txt` リアルタイムレイヤー合成および部位当たり判定（Collision）逆算
- **文字コード & 仮想ファイルシステム**:
  - `encoding_rs` による Shift_JIS (CP932) ↔ UTF-8 自動判別・透過読込
  - Windows / Android のファイルパス大文字小文字の差異を吸収する仮想ファイルシステム (VFS)

---

## 3. 互換性と仕様

- **伺か規格互換**:
  - `descript.txt`, `surfaces.txt`, `surfacetable.txt` の完全パース
  - さくらスクリプト（`\0`, `\1`, `\s[ID]`, `\w[N]`, `\q[選択肢]`, `\e` 等）のトークナイズと非同期キューイング
  - 伺か標準右クリックメニュー（クラシックUI、階層サブメニュー、アクセスキー対応）
  - 二体同時表示（メインキャラ \0 sakura / 相方キャラ \1 kero）
- **SHIORI 連携（多層フォールバック）**:
  - **Layer 1 (Win32)**: ネイティブ DLL 直接ロード
  - **Layer 2 (WebAssembly)**: C/C++（里々 / YAYA）を WASM 化し、Web Worker 内で安全に非同期実行
  - **Layer 3 (フォールバック)**: 辞書ファイル簡易パーサーおよびフロントエンド内蔵モック
  - **Layer 4 (モダン拡張)**: JavaScript / Web 標準 API によるプラグイン拡張

---

## 4. 開発・実装アプローチ

1. **Windows First (デスクトップ先行検証)**:
   - PC 環境の利点を活かして YAYA/里々連携、透過表示、クラシックUI、文字送り、当たり判定を完全に実装・安定化
2. **Android Adaptation (モバイル適応)**:
   - Single Activity Container（WebView）構成に最適化
   - Android システムオーバーレイ (`SYSTEM_ALERT_WINDOW`)、常駐サービス (`FOREGROUND_SERVICE`)、画面端ドッキング退避の適用
3. **拡張機能 & プラグインエコシステム**:
   - Web 標準技術を活用し、一般開発者・ゴースト制作者が手軽に機能拡張・スキン変更を行えるプラットフォームの提供
