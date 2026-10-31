- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **PLUGIN 規格**: [ukadoc-spec: plugin](https://ukatech.shillest.net/ukadoc-spec/spec/plugin/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **バルーン仕様 (Balloon)**: [ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

> **AI 関与について**: このドキュメントは GitHub
> Copilot の支援により作成されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。

# Nanai Android Mascot ドキュメント

## 📚 ドキュメント構成

### 📖 ユーザー向けドキュメント (`doc/user`)

- **[installation.md](doc/user/installation.md)** - インストール手順・ビルドガイド（Windows / Android）
- **[user-guide.md](doc/user/user-guide.md)** - 基本的な使用方法・操作ガイド
- **[troubleshooting.md](doc/user/troubleshooting.md)** - トラブルシューティング
- **[credits-and-license.md](credits-and-license.md)** - 権利表記・著作権・ライセンス（使用単語・規格等の権利者表記）

### 🛠️ 開発者向けドキュメント (`doc/developer`)

- **[architecture.md](doc/developer/architecture.md)** - システムアーキテクチャ（Frontend / Tauri Bridge / Rust Backend）
- **[dpi-patch-spec.md](doc/developer/specs/dpi-patch-spec.md)** - dpi クレート改変仕様・記録書 (patches/dpi)

### 📐 設計・ロードマップ (`doc/design`)

- **[ghost-loading-and-animation-policy.md](doc/design/cache-and-async/ghost-loading-and-animation-policy.md)** - ゴースト読み込み・バナー・会話表示・サーフィス描画の負荷対策コンセプト
- **[implementation-plan-and-spec.md](doc/design/planning/implementation-plan-and-spec.md)** - 次期フェーズ実装計画 & 統合技術仕様書 (Phase 2+)
- **[pending-issues-and-roadmap.md](doc/design/planning/pending-issues-and-roadmap.md)** - 検討事項・仕様化ロードマップ（全体概要）
- **[mockup-and-android-spec.md](doc/design/ui/mockup-and-android-spec.md)** - UI/UX & モックアップ仕様書（PCシミュレーション・モバイル画面設計）
- **[ui-and-menu-spec.md](doc/design/ui/ui-and-menu-spec.md)** - 標準UI & 拡張メニュー仕様書
- **[window-design.md](doc/design/ui/window-design.md)** - ウィンドウ設計（Windows検証 / Android Single Container）

### 🔧 仕様適合確認・マスター規格 (`spec/`)

- **[SUMMARY.md](spec/SUMMARY.md)** - 規格別実装適合度自動集計マスタサマリ
- **[ssp-master-compatibility-spec.md](spec/nas-spec/ssp-master-compatibility-spec.md)** - SSP 互換・暗黙規格統括マスター仕様書 (96 DPI換算, Mutex, DLL, `seriko.use_self_alpha`等)
- **[ssp-font-and-ui-spec.md](spec/nas-spec/ssp-font-and-ui-spec.md)** - SSP 暗黙仕様: フォントサイズ・インライン要素サイズフィット規格
- **[explorer.md](spec/ssp-external-spec/explorer.md)** - エクスプローラ機能仕様
- **[menu-bitmap.md](spec/ssp-external-spec/menu-bitmap.md)** - オーナードローメニュー・背景画像仕様
- **[window-snap.md](spec/ssp-external-spec/window-snap.md)** - ウィンドウ・スナップ機能および位置リセット仕様

### 📐 内部設計技術仕様書 (`doc-spec/`)

- **[standard-ghost-spec.md](doc-spec/ghost/standard-ghost-spec.md)** - 公式サンプルキャラクター仕様書（モック & プチ）
- **[sakura-script-and-balloon-spec.md](doc-spec/shiori-script/sakura-script-and-balloon-spec.md)** - さくらスクリプトパーサー & バルーン文字送り仕様書
- **[surfaces-and-collision-spec.md](doc-spec/ghost/surfaces-and-collision-spec.md)** - surfaces.txt アニメーション合成 & 当たり判定仕様書
- **[encoding-and-vfs-spec.md](doc-spec/platform/encoding-and-vfs-spec.md)** - 文字コード変換 (Shift_JIS ↔ UTF-8) & 仮想ファイルシステム (VFS) 仕様書
- **[android-overlay-and-service-spec.md](doc-spec/platform/android-overlay-and-service-spec.md)** - Android システムオーバーレイ & 常駐生存仕様書
- **[plugin-and-shiori-fallback-spec.md](doc-spec/shiori-script/plugin-and-shiori-fallback-spec.md)** - プラグイン & SHIORI 読込み・代替読込み (Fallback) 仕様書
- **[wasm-and-plugin-extensibility.md](doc-spec/platform/wasm-and-plugin-extensibility.md)** - WASM化指針 & JavaScript拡張システム仕様書
- **[shiori-integration.md](doc-spec/shiori-script/shiori-integration.md)** - SHIORI 組み込み統合技術仕様
- **[ssp-compatibility-reference.md](doc-spec/reference/ssp-compatibility-reference.md)** - SSP 仕様ベース 統合互換リファレンスマニュアル
- **[local-reference-and-test-spec.md](doc-spec/reference/local-reference-and-test-spec.md)** - ローカル外部仕様・試験環境（local/）連携仕様書
- **[ghost-compatibility-gap-and-roadmap.md](doc-spec/ghost/ghost-compatibility-gap-and-roadmap.md)** - 伺かゴースト互換性ギャップ分析と実装改善ロードマップ仕様書
- **[compatibility-implementation-plan.md](doc-spec/reference/compatibility-implementation-plan.md)** - 互換実装計画仕様書
- **[specification-compliance-matrix.md](doc-spec/reference/specification-compliance-matrix.md)** - 仕様適合マトリクス

### 📋 開発プロセス & 履歴 (`doc/process`)

- **[AI_driven.md](doc/process/AI_driven.md)** - AI 駆動開発の手法と実践記録
- **[development-approach.md](doc/process/development-approach.md)** - 開発アプローチ・技術選定
- **[doc_history.md](doc/process/doc_history.md)** - ドキュメント変更履歴
- **[documentation-proposal.md](doc/process/documentation-proposal.md)** - ドキュメント戦略・提案

### 🔬 調査・研究メモ (`doc/research`)

- **[all_desktopmascot.md](doc/research/all_desktopmascot.md)** - デスクトップマスコットの立ち位置・原理検討メモ
- **[compare_baseware.md](doc/research/compare_baseware.md)** - 互換ベースウェア比較
- **[compare_chara_solution.md](doc/research/compare_chara_solution.md)** - キャラクターソリューション比較
- **[compare_device_solution.md](doc/research/compare_device_solution.md)** - 音声アシスタント・スマートデバイス比較
- **[dependency-licenses.md](doc/research/dependency-licenses.md)** - 依存ライセンス調査報告書（Rust/npm/伺か系SHIORI）

## 🚀 クイックスタート

### 初めて使う方

1. **[インストールガイド](doc/user/installation.md)** でアプリをインストール
2. **[ユーザーガイド](doc/user/user-guide.md)** で基本的な使用方法を確認
3. 問題が発生した場合は **[トラブルシューティング](doc/user/troubleshooting.md)** を参照

### 開発に参加したい方

1. **[貢献ガイド](../CONTRIBUTING.md)** で貢献方法を確認
2. **[システムアーキテクチャ](doc/developer/architecture.md)** でシステム構成を理解
3. **[AI 主導開発](doc/process/AI_driven.md)** で開発手法を把握

## 📝 ドキュメントの特徴

### AI 主導開発の記録

このプロジェクトは、AI（GitHub Copilot）を活用した開発手法の実践例です。そのため、従来のドキュメントとは異なる特徴があります：

- **AI 関与の明記**: 各ドキュメントで AI の関与度を明記
- **開発プロセスの記録**: AI 活用の具体的な手法を記録
- **品質管理手法**: AI 生成コンテンツの品質管理方法

### 継続的な更新

- **開発と連動**: コードの変更と同期してドキュメントを更新
- **フィードバック反映**: ユーザーからの意見を積極的に取り入れ
- **品質向上**: 定期的な見直しと改善

## 🎯 対象読者

### 📱 エンドユーザー

- **デスクトップマスコット愛好家**
- **伺かユーザー**
- **Android アプリユーザー**

### 👨‍💻 開発者

- **オープンソース貢献者**
- **Tauri/Rust 開発者**
- **AI 活用開発に興味がある開発者**

### 🔬 研究者・学習者

- **AI 主導開発の研究者**
- **ソフトウェア開発手法の学習者**
- **クロスプラットフォーム開発の学習者**

## 🔍 ドキュメントを探す

### 目的別

- **インストールしたい** → [インストールガイド](doc/user/installation.md)
- **使い方を知りたい** → [ユーザーガイド](doc/user/user-guide.md)
- **問題を解決したい** → [トラブルシューティング](doc/user/troubleshooting.md)
- **開発に参加したい** → [貢献ガイド](../CONTRIBUTING.md)
- **システムを理解したい** → [アーキテクチャ](doc/developer/architecture.md)
- **AI 開発に興味がある** → [AI 主導開発](doc/process/AI_driven.md)

### 技術レベル別

- **初心者・ユーザー** → [ユーザー向けガイド](doc/user/user-guide.md) (`doc/user` ディレクトリ)
- **開発者・コントリビューター** → [システムアーキテクチャ](doc/developer/architecture.md) (`doc/developer` ディレクトリ)
- **設計・ロードマップ確認** → [実装計画](doc/design/planning/implementation-plan-and-spec.md)、[ロードマップ](doc/design/planning/pending-issues-and-roadmap.md) (`doc/design` ディレクトリ)
- **仕様策定・互換レイヤー実装** → 各種技術仕様書（[文字コード/VFS仕様](doc/platform/encoding-and-vfs-spec.md)、[SHIORIフォールバック仕様](doc/shiori-script/plugin-and-shiori-fallback-spec.md)等、`spec/` ディレクトリ）
- **開発プロセス・背景設計** → [AI主導開発](doc/process/AI_driven.md)、[開発アプローチ](doc/process/development-approach.md) (`doc/process` ディレクトリ)

## 🤝 ドキュメントの改善

### 改善の提案

ドキュメントの改善提案は以下の方法で受け付けています：

1. **GitHub Issues** - 誤字脱字、不明確な説明の報告
2. **Pull Requests** - 直接的な改善提案
3. **Discussions** - 大きな変更やアイデアの議論

### 貢献方法

- **誤字脱字の修正**
- **説明の明確化**
- **新しい情報の追加**
- **翻訳の支援**

詳細は[貢献ガイド](../CONTRIBUTING.md)を参照してください。

## 📊 品質管理

### 品質基準

- **正確性**: 技術的に正確な情報
- **完全性**: 必要な情報の網羅
- **最新性**: 最新の実装状況を反映
- **一貫性**: 統一されたスタイルと構造

### 更新プロセス

1. **定期レビュー**: 月次での内容確認
2. **コード連動**: 実装変更時の同期更新
3. **フィードバック反映**: ユーザー報告の対応
4. **品質チェック**: 公開前の最終確認

## 📅 更新履歴

### 2026 年 10 月 24 日

- ドキュメントインデックス（README.md）を再編し、全詳細仕様書へのリンクおよび実装状況を最新化
- 実装フェーズ（Tauri v2、mock_nanai 構成、フォールバック機構、VFS/文字コード仕様）の反映

### 2025 年 7 月 11 日

- 初期ドキュメント構成の作成
- AI 主導開発ドキュメントの追加
- ユーザーガイドの作成
- システムアーキテクチャの文書化

### 今後の予定

- 各プラットフォーム向け実機テストログの拡充
- WASM SHIORI ビルド・実行手順の追記
- 多言語対応

---

_このドキュメントは継続的に更新され、プロジェクトの成長と共に改善されます。_

_最終更新: 2026 年 10 月 24 日_
