> **AI 関与について**: このドキュメントは Antigravity の支援により作成されました。調査対象・比較軸・構成方針はオーナーユーザーと AI の協議により決定されています。

# 既存ベースウェア比較検討 計画・目次

既存の伺か（UKAGAKA）互換ベースウェアおよび関連プロジェクトを横断的に調査し、**Nanai Android Mascot** の設計判断（ウィンドウ方式・SHIORI 実行・描画・互換範囲・モバイル/Web 適応）に還元するための比較検討計画と目次構成を定義します。

関連メモ: [compare_baseware.md](compare_baseware.md)

---

## 目次構成案

### 1. 調査の目的・位置づけ

- **1.1 本比較で明らかにしたい設計判断**
  - ウィンドウ管理方式（マルチウィンドウ vs 単一キャンバス統合、OS オーバーレイ / Wayland / macOS / Android 制約への対処）
  - SHIORI / SAORI / MAKOTO / PLUGIN 実行方式（Win32/64 DLL 動的ロード・ホストプロセス・静的リンク/ネイティブ `.so`・WASM・独自実装）
  - 描画・透過・HiDPI スケーリング方針
  - SSP 準拠の互換範囲と、あえて割り切る仕様の境界
  - モバイル・Web 環境への操作性および省メモリ・常駐設計の適応
- **1.2 調査ルール**
  - 各リポジトリのソースコード・公式 README・ドキュメント・実機挙動に基づく事実整理
  - 未確認・未検証の項目は推測で埋めず「未確認」と明記する
  - 各プロジェクトのライセンス・権利表記を明記する

### 2. 比較対象ベースウェア一覧（基本プロファイル）

対象ごとに「対応 OS / 言語・GUI 基盤 / 開発状況 / ライセンス / 設計思想 / 本作での参照位置づけ」を一覧化する。

| 対象 | リポジトリ / 参照先 | 主な対象 OS | 本作での参照位置づけ |
| :--- | :--- | :--- | :--- |
| **SSP (BUGFIX)** | 公式サイト | Windows | 動作互換・仕様目標の基準リファレンス |
| **ninix-kagari** | [Tatakinov/ninix-kagari](https://github.com/Tatakinov/ninix-kagari) | Linux | 非 Windows 環境での互換実装・Ruby/GTK 構成の参照 |
| **ninixw** | [Tatakinov/ninixw](https://github.com/Tatakinov/ninixw) | Linux / Windows 等 | Wayland/X/Windows クロスプラットフォーム設計の参照 |
| **Utatane** | [opera7133/Utatane](https://github.com/opera7133/Utatane) | macOS | macOS ネイティブ統合・SHIORI 連携方式の参照 |
| **Ourin** | [eightman999/Ourin](https://github.com/eightman999/Ourin) | macOS | モダン macOS (Swift) 実装・UI/ウィンドウ設計の参照 |
| **areka** | [ekicyou/areka](https://github.com/ekicyou/areka) | 独自基盤 | GUI フレームワーク段階からの新設計アプローチの参照 |
| **pono-droid** | [ukagaka-irono/pono-droid](https://github.com/ukagaka-irono/pono-droid) | Android | Android オーバーレイ・NAR 運用・モバイル UI の参照 |
| **Engawa** | [ukagaka-irono/Engawa](https://github.com/ukagaka-irono/Engawa) | Web | Web/JS ベースでの描画・バルーン・配布体験の参照 |
| **Ikagaka** | [Ikagaka](https://github.com/Ikagaka) | Web / ブラウザ（Electron 含む） | JS/TS ベースの伺か互換ライブラリ群・Web 描画/SHIORI 実行アーキテクチャの参照 |
| **Nanai Android Mascot** | 本リポジトリ | Windows / Android / Web | Tauri v2 + Rust + WebView + WASM による比較軸の主体 |

_(※既存の [compare_baseware.md](compare_baseware.md) に記載している **Ukadroid** も Android 先行実装の参考列として適宜併記する)_

### 3. アーキテクチャ軸での横断比較

- **3.1 ウィンドウ管理・透過・当たり判定**
  - マルチウィンドウ構成と単一オーバーレイ/キャンバス統合の比較
  - タッチスルー / クリックスルー・入力透過の OS 別実装戦略
- **3.2 サーフィス描画・アニメーション合成**
  - SERIKO / MAYUNA の対応状況、alpha 合成・クロマキー・`.pna`・`.ico/.cur/.ani`
  - HiDPI（`scale_factor` / 96 DPI 基準）への対応方針
- **3.3 バルーン描画・さくらスクリプト実装**
  - 文字送り・スクロール・タグ互換・縦書き・独自拡張の扱い
- **3.4 SHIORI / SAORI / MAKOTO / PLUGIN 実行方式**
  - Windows DLL ロード、32bit/64bit ブリッジ、Wine / ホストプロセス、ネイティブ `.so` / 静的リンク、WASM、フォールバック戦略
- **3.5 外部連携・補助プロトコル**
  - SSTP / FMO / ネットワーク更新（`updates2.dau` 等）/ NAR インストール / 文字コード（`Shift_JIS` ↔ `UTF-8`）
- **3.6 UI・操作性・モバイル適応**
  - メニュー構造（オーナードロー等）、ウィンドウ・スナップ、タッチ操作、省メモリ・バックグラウンド常駐

### 4. 各ベースウェア個別調査メモ（詳細セクション）

4.1 〜 4.9（SSP / ninix-kagari / ninixw / Utatane / Ourin / areka / pono-droid / Engawa / Ikagaka）について、以下の統一テンプレートで整理する。

- アーキテクチャ概要（言語・GUI 基盤・プロセス/スレッド構成）
- 強み・独自の工夫
- 制約・割り切りポイント
- 本作へ取り入れられる設計知見

### 5. Nanai Android Mascot への設計フィードバック（まとめ）

- **5.1 本作の差別化ポイントと立ち位置の再定義**
  - Windows First 実証から Android 展開へ進む Tauri + WebView + Rust + WASM 構成の優位性と課題
- **5.2 採用・参考にする設計パターン**
  - Android オーバーレイ（[android-window-architecture.md](../nam-spec/android-window-architecture.md) との突合）
  - Web 描画・バルーン表現・JS 互換ライブラリ知見（`Engawa` / `Ikagaka` 等の知見）
  - 非 Windows SHIORI 実行・フォールバック（`ninix-kagari` / `ninixw` / `Utatane` / `Ourin` 等の知見）
  - 新規ベースウェア設計思想（`areka` 等の知見）
- **5.3 あえて非互換・割り切りとする領域と今後の検証タスク**

---

## 調査の進め方（フェーズ案）

1. **Phase 1（基本情報収集）**: 各リポジトリの README・ディレクトリ構成・使用技術・SHIORI 実行方式・ウィンドウ方式を一次ソースから整理し、2章の一覧表を埋める。
2. **Phase 2（技術軸の深掘り）**: 3章の6軸についてコードベースおよびドキュメントを確認し、比較マトリクスと4章の個別調査メモを作成する。
3. **Phase 3（本作への還元）**: 既存の [android-window-architecture.md](../nam-spec/android-window-architecture.md) や [shiori-runtime-and-dynamic-module-policy.md](../architecture/shiori-runtime-and-dynamic-module-policy.md) と突合し、5章の設計フィードバックを確定する。
