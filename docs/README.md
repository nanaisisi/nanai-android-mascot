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

### 📖 ユーザー向けドキュメント (`user/`)

- **[installation.md](user/installation.md)** - インストール手順・ビルドガイド（Windows / Android）
- **[user-guide.md](user/user-guide.md)** - 基本的な使用方法・操作ガイド
- **[troubleshooting.md](user/troubleshooting.md)** - トラブルシューティング
- **[credits-and-license.md](credits-and-license.md)** - 権利表記・著作権・ライセンス（使用単語・規格等の権利者表記）

### 🛠️ 開発者向けドキュメント (`developer/`)

- **[architecture.md](developer/architecture.md)** - システムアーキテクチャ（Frontend / Tauri Bridge / Rust Backend）
- **[dpi-patch-spec.md](developer/specs/dpi-patch-spec.md)** - dpi クレート改変仕様・記録書 (patches/dpi)

### 📐 設計・ロードマップ (`design/`)

- **[implementation-plan-and-spec.md](design/planning/implementation-plan-and-spec.md)** - 次期フェーズ実装計画 & 統合技術仕様書 (Phase 2+)
- **[pending-issues-and-roadmap.md](design/planning/pending-issues-and-roadmap.md)** - 検討事項・仕様化ロードマップ（全体概要）
- **[mockup-and-android-spec.md](design/ui/mockup-and-android-spec.md)** - UI/UX & モックアップ仕様書（PCシミュレーション・モバイル画面設計）
- **[ui-and-menu-spec.md](design/ui/ui-and-menu-spec.md)** - 標準UI & 拡張メニュー仕様書
- **[window-design.md](design/ui/window-design.md)** - ウィンドウ設計（Windows検証 / Android Single Container）

### 🔧 詳細技術仕様書 (`spec/`)

- **[standard-ghost-spec.md](spec/ghost/standard-ghost-spec.md)** - 公式サンプルキャラクター仕様書（モック & プチ）
- **[sakura-script-and-balloon-spec.md](spec/shiori-script/sakura-script-and-balloon-spec.md)** - さくらスクリプトパーサー & バルーン文字送り仕様書
- **[surfaces-and-collision-spec.md](spec/ghost/surfaces-and-collision-spec.md)** - surfaces.txt アニメーション合成 & 当たり判定仕様書
- **[encoding-and-vfs-spec.md](spec/platform/encoding-and-vfs-spec.md)** - 文字コード変換 (Shift_JIS ↔ UTF-8) & 仮想ファイルシステム (VFS) 仕様書
- **[android-overlay-and-service-spec.md](spec/platform/android-overlay-and-service-spec.md)** - Android システムオーバーレイ & 常駐生存仕様書
- **[plugin-and-shiori-fallback-spec.md](spec/shiori-script/plugin-and-shiori-fallback-spec.md)** - プラグイン & SHIORI 読込み・代替読込み (Fallback) 仕様書
- **[wasm-and-plugin-extensibility.md](spec/platform/wasm-and-plugin-extensibility.md)** - WASM化指針 & JavaScript拡張システム仕様書
- **[shiori-integration.md](spec/shiori-script/shiori-integration.md)** - SHIORI 組み込み統合技術仕様
- **[ssp-compatibility-reference.md](spec/reference/ssp-compatibility-reference.md)** - SSP 仕様ベース 統合互換リファレンスマニュアル
- **[local-reference-and-test-spec.md](spec/reference/local-reference-and-test-spec.md)** - ローカル外部仕様・試験環境（local/）連携仕様書
- **[ghost-compatibility-gap-and-roadmap.md](spec/ghost/ghost-compatibility-gap-and-roadmap.md)** - 伺かゴースト互換性ギャップ分析と実装改善ロードマップ仕様書
- **[compatibility-implementation-plan.md](spec/reference/compatibility-implementation-plan.md)** - 互換実装計画仕様書
- **[specification-compliance-matrix.md](spec/reference/specification-compliance-matrix.md)** - 仕様適合マトリクス

### 📋 開発プロセス & 履歴 (`process/`)

- **[AI_driven.md](process/AI_driven.md)** - AI 駆動開発の手法と実践記録
- **[development-approach.md](process/development-approach.md)** - 開発アプローチ・技術選定
- **[doc_history.md](process/doc_history.md)** - ドキュメント変更履歴
- **[documentation-proposal.md](process/documentation-proposal.md)** - ドキュメント戦略・提案

### 🔬 調査・研究メモ (`research/`)

- **[all_desktopmascot.md](research/all_desktopmascot.md)** - デスクトップマスコットの立ち位置・原理検討メモ
- **[compare_baseware.md](research/compare_baseware.md)** - 互換ベースウェア比較
- **[compare_chara_solution.md](research/compare_chara_solution.md)** - キャラクターソリューション比較
- **[compare_device_solution.md](research/compare_device_solution.md)** - 音声アシスタント・スマートデバイス比較

## 🚀 クイックスタート

### 初めて使う方

1. **[インストールガイド](user/installation.md)** でアプリをインストール
2. **[ユーザーガイド](user/user-guide.md)** で基本的な使用方法を確認
3. 問題が発生した場合は **[トラブルシューティング](user/troubleshooting.md)** を参照

### 開発に参加したい方

1. **[貢献ガイド](../CONTRIBUTING.md)** で貢献方法を確認
2. **[システムアーキテクチャ](developer/architecture.md)** でシステム構成を理解
3. **[AI 主導開発](process/AI_driven.md)** で開発手法を把握

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

- **インストールしたい** → [インストールガイド](user/installation.md)
- **使い方を知りたい** → [ユーザーガイド](user/user-guide.md)
- **問題を解決したい** → [トラブルシューティング](user/troubleshooting.md)
- **開発に参加したい** → [貢献ガイド](../CONTRIBUTING.md)
- **システムを理解したい** → [アーキテクチャ](developer/architecture.md)
- **AI 開発に興味がある** → [AI 主導開発](process/AI_driven.md)

### 技術レベル別

- **初心者・ユーザー** → [ユーザー向けガイド](user/user-guide.md) (`user/` ディレクトリ)
- **開発者・コントリビューター** → [システムアーキテクチャ](developer/architecture.md) (`developer/` ディレクトリ)
- **設計・ロードマップ確認** → [実装計画](design/planning/implementation-plan-and-spec.md)、[ロードマップ](design/planning/pending-issues-and-roadmap.md) (`design/` ディレクトリ)
- **仕様策定・互換レイヤー実装** → 各種技術仕様書（[文字コード/VFS仕様](spec/platform/encoding-and-vfs-spec.md)、[SHIORIフォールバック仕様](spec/shiori-script/plugin-and-shiori-fallback-spec.md)等、`spec/` ディレクトリ）
- **開発プロセス・背景設計** → [AI主導開発](process/AI_driven.md)、[開発アプローチ](process/development-approach.md) (`process/` ディレクトリ)

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
