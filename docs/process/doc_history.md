- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **バルーン仕様 (Balloon)**: [ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

> **AI 関与について**: このドキュメントは GitHub
> Copilot の支援により作成されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。

# ドキュメント変更履歴

## 2026 年 10 月 26 日 - ゴースト互換性ギャップ分析とロードマップ仕様策定

### 新規作成

- **[ghost-compatibility-gap-and-roadmap.md](../spec/ghost/ghost-compatibility-gap-and-roadmap.md)**:
  - 32bit DLL読み込み・差分表示の現状実装を踏まえ、一般的な伺かゴースト資産の再現に必要な不足機能（ウェイト制御・SERIKOアニメーション・当たり判定・自律発話タイマー・バルーンスキン・VFS）のギャップ一覧化と、依存関係に基づく4段階の実装優先順位ロードマップを策定。

### 機能更新

- **サーフィス多重画像合成 (lement0〜lementN)**:
  - surfaces.txt 内の element 重ね合わせ指定（overlay,
    eplace 等）を Canvas レイヤーで事前自動合成する composeSurfaceElements を実装。
- **バルーンスキン仕様拡張**:
  - descript.rs にバルーン定義用アクセサ（origin.x, origin.y, alidrect, ont.color）を追加。

## 2025 年 6 月 30 日 - 開発方針の大幅変更

### window-design.md の変更

#### 1. 開発段階セクション（変更前後）

> **重要**: 当初 Android 向けに特化した実装を行ったが、実装が混乱、不明瞭。
> Windows 環境での十分な検証と機能実装を優先し、段階的に Android に移植する方針に変更。

```markdown
## 開発段階

~~

### 修正された開発フロー

1. **Windows First**: PC 環境での多機能実装・検証
   - 複数ウィンドウによる表現
   - デスクトップ環境の利点を活用
   - YAYA 連携の完全実装
   - 透過・フローティング・Always On Top 等の高度機能

2. **Android Adaptation**: 検証済み機能の移植
   - Windows 版で実証された機能をベースに
   - プラットフォーム制約に応じた適応
   - 必要に応じた機能の調整・統合
```

**変更理由**:
Android 特化による不明瞭さ、Windows 環境での機能実装を優先する方針に転換

#### 2. 実装順序セクション（大幅変更）

**変更前:**

```markdown
### Phase 1: Android 基本実装

- WebView 内でのキャラクター表示
- Single Activity Container 構築

### Phase 2: Android UI 拡張

- 設定画面・メッセージ機能実装

### Phase 3: Windows 検証環境

- 複数ウィンドウ版の作成（副次的）

### Phase 4: Android 高度機能

- システムオーバーレイ対応
```

**変更後:**

```markdown
### Phase 1: Windows多機能実装

- PC環境での完全機能実装・検証
- 独立した複数ウィンドウ（ゴースト、設定、バルーン）
- YAYA Shioriとの完全連携
- システムトレイ・ホットキー対応

### Phase 2: Windows機能拡張・安定化

- 高度機能の実装と動作安定性確保
- 複雑なアニメーション・エフェクト
- プラグインシステム

### Phase 3: Android基盤移植

- Windows版機能のAndroid環境への適応
- Single Activity Container化

### Phase 4: Android高度機能

- Android固有機能の活用
```

**変更理由**:
Windows 環境を主軸とした段階的開発に変更、Android 移植は後続フェーズに

#### 3. 新規追加セクション

**追加内容:**

```markdown
## 開発方針の転換

### 現状の反省点

1. **過度な Android 特化**: PC 環境の利点を活用できていない
2. **機能制限**: Single Activity Container による表現力の制限
3. **YAYA 連携不足**: 独自実装によるエコシステムとの乖離

### 新方針: Windows First Development

1. **複数ウィンドウ活用**: 各機能を独立したウィンドウとして実装
2. **デスクトップ環境最適化**: 透過、Always On Top、フローティング等の活用
3. **YAYA 完全連携**: Shiori DLL との直接連携
4. **段階的移植**: Windows 版ベースで Android 版開発

### 今後の作業

1. **index.html の最小化**: 複雑な実装を基本構造のみに簡素化
2. **独立ウィンドウ設計**: 各機能を独立 HTML ファイルに分離
3. **YAYA 連携基盤**: Tauri 経由 Shiori DLL 呼び出し実装
4. **Windows 向け最適化**: デスクトップ環境の利点最大化
```

**追加理由**: 方針転換の背景と具体的な作業方針を明確化

```markdown
### 影響を受けるファイル

#### src/index.html

- **変更**: Android 特化の複雑な UI → Windows 開発用最小限 UI
- **内容**: Single Activity Container 削除、開発用ボタン追加

#### src/main.js

- **変更**: Android 特化コントローラー → Windows 開発基盤クラス
- **内容**: 複数ウィンドウ管理、YAYA 連携スタブ実装

#### src/styles.css

- **変更**: Android 特化スタイル → Windows 向け開発 UI
- **内容**: タッチ操作対応削除、デスクトップ向けスタイル採用

### 技術的な方針変更

1. **UI 設計**: Single Activity Container → 複数独立ウィンドウ
2. **プラットフォーム**: Android First → Windows First
3. **機能実装**: 制約ベース → 機能フル実装
4. **連携**: 簡易実装 → YAYA 完全連携

### 期待される効果

1. **多機能性の回復**: PC 環境の利点を最大活用
2. **拡張性の向上**: 段階的機能追加が容易
3. **エコシステム連携**: 既存 SHIORI 環境との完全互換
4. **開発効率**: 制約の少ない環境での迅速な機能実装
```

## 2025 年 6 月 30 日（続） - 方針の再見直し・整理

### 目的: Android 向け UI 検証を主軸とした方針への回帰

#### 実施内容

1. **window-design.md の方針明確化**
   - Windows は Android 向け UI の検証用であることを明記
   - 将来的な Windows 固有機能（Splashscreen 等）は分離検討対象として明記
   - 実装順序から Windows 固有機能を分離し、将来的検討事項に変更

2. **方針転換の理由**
   - Android 向け UI の検証・開発に集中したい
   - Windows 固有機能は現在のスコープ外とし、混乱を避ける
   - 段階的・焦点を絞った開発アプローチの採用

3. **具体的な変更点**
   - 概要セクション: Windows 検証用の役割を明記
   - ファイル配置: Windows 固有構成を将来検討事項として分離
   - Tauri 設定: Windows 固有設定を将来検討事項として分離
   - 実装順序: Windows 固有機能を将来的検討事項に移動

**変更理由**:
Android 向け UI の検証・実装に集中し、将来的な話は分離することで明確性を向上。

## 2026 年 10 月 24 日 - ドキュメント体系の再編・仕様最新化

### 実施内容

1. **ドキュメント目次（`docs/README.md`）の全面改訂**
   - 課題1〜4および関連仕様書（さくらスクリプト、surfaces/当たり判定、文字コード/VFS、Android常駐/オーバーレイ、標準UI、モックアップ、WASM/プラグイン拡張、多層フォールバック等）を体系的に網羅・整理。
   - 存在しない架空のパス（`technical/`、`process/`）を解消し、実在するドキュメントへのリンクを整備。

2. **実装状況・アセット構成との整合性確保（`development-approach.md`）**
   - 公式サンプルゴースト（`mock_nanai`）の最新ディレクトリ構成（`surfaces.txt`, `surfacetable.txt`, `satori.dll`, `dic_*.txt` 等）を正確に反映。
   - プラットフォーム拡張方針および多層フォールバック機構（ネイティブ DLL → WASM → JS/TS モック）の連携を明記。
