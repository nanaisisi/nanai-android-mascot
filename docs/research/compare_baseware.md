> **AI 関与について**: このドキュメントは GitHub
> Copilot の支援により作成されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。

# 互換ベースウェア・コミュニティ調査比較

## 1. 公式・準公式技術コミュニティ

伺かのベースウェア周辺技術（SHIORI、各種仕様、ツール群）を現在開発・保守している中核コミュニティとして **Ukagaka Tech Team** が存在します。

- **サイト**: [Ukagaka Tech Team (ukatech)](https://ukatech.shillest.net/)
- **公式仕様・ドキュメントリポジトリ**:
  - [ukatech/ukadoc-spec](https://github.com/ukatech/ukadoc-spec) - UKADOC 公式仕様書リポジトリ（さくらスクリプト・SHIORIプロトコル・サーフィス定義等の標準仕様）
  - [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) - SSP 固有機能および拡張仕様リポジトリ
  - [UKADOC Project マニュアル](https://ssp.shillest.net/ukadoc/) - Web 公開版マニュアル
- **主な保守プロジェクト**:
  - **YAYA**: 汎用スクリプトSHIORI（[yaya-shiori](https://github.com/YAYA-shiori/yaya-shiori)）
  - **里々 (SATORI)**: 台本形式SHIORI（[satoriya-shiori](https://github.com/ukatech/satoriya-shiori)）
  - **華和梨 (KAWARI)**: KISインタプリタSHIORI

---

## 2. 互換ベースウェアの比較・立ち位置

| ベースウェア / ソフトウェア | プラットフォーム | 主な特徴・アプローチ | 本プロジェクトでの位置づけ |
| :--- | :--- | :--- | :--- |
| **SSP (BUGFIX)** | Windows (x86/x64) | 現代の事実上の標準ベースウェア。膨大な互換性と機能群を搭載。Win32/C++製。 | 動作互換・仕様目標の基準リファレンス |
| **Ukadroid** | Android | Android 向けに長年提供されている実績豊富な伺か互換アプリ。 | 既存のモバイル先行実装・互換比較対象 |
| **Nanai Android Mascot** (本作) | Windows / Android / Web | Tauri v2 + Rust + Web標準技術 (Canvas 2D / CSS)。WASM/ネイティブ併用、AI連携。 | 新世代のクロスプラットフォーム・省メモリ実装 |
