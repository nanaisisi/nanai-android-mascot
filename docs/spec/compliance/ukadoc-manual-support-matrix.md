# マニュアル仕様 (ukadoc-spec/manual/) 対応可能性・サポート評価マトリクス (Manual Support Matrix)

- **参照公式仕様**: [ukatech/ukadoc-spec: manual](https://github.com/ukatech/ukadoc-spec/tree/main/manual)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../developer/strict-code-verification-system.md)

本ドキュメントは、`ukadoc-spec/manual/` 配下の各マニュアル仕様書（`balloon.md`, `directory.md`, `ghost.md`, `install.md`, `owner-draw-menu.md`, `shell.md`, `translator.md`, `update.md`）について、Nanai Android Mascot（Tauri / Rust / Webフロントエンド）における**対応可能性（Feasibility）および実装サポート状況**を評価・記録した公式評価マトリクスである。

---

## 1. マニュアルファイル別 対応可能性・サポートマトリクス

| 規格マニュアルファイル | 対象機能・領域 | 対応ステータス | Nanai における対応方針・実現方式 | 主要な実装・対応箇所 |
| :--- | :--- | :---: | :--- | :--- |
| **`balloon.md`** | バルーンの構造、画像、`descript.txt` 属性、フォント・余白 | **✅ 対応済 (Fully Supported)** | `descript.txt` のパース、9-slice (pna/png) 描画、スコープ別独立バルーン表示 | `ui/js/core/actions/balloon-descript/`, `ui/js/ui/balloon.js` |
| **`directory.md`** | 伺か標準ディレクトリ構造 (`ghost/`, `shell/`, `balloon/`) | **✅ 対応済 (Fully Supported)** | VFS による大文字小文字吸収パス解決、`userData/ghost` と `local/ghost` の優先順位付き走査 | `src-tauri/src/ghost/scan/directory.rs` |
| **`ghost.md`** | ゴーストのファイル構造、SHIORI連携、`\0` / `\1` キャラクタ | **✅ 対応済 (Fully Supported)** | ネイティブ DLL / WASM / JS SHIORI の動的ロード、`OnBoot`等の基本イベントルーティング | `src-tauri/src/shiori/`, `ui/js/ghost/ghost.js` |
| **`install.md`** | `.nar` / `.zip` アーカイブ導入、`install.txt` 処理 | **⚠️ 部分対応 (Partially Supported)** | ゴースト・バルーンの安全な NAR 展開（ZipSlip防止）、シェル等への拡張余地 | `src-tauri/src/commands/install/` |
| **`owner-draw-menu.md`** | カスタムデザイン可能な右クリックオーナードローメニュー | **⚠️ 部分対応 (Partially Supported)** | Webview/iframe による高機能コンテキストメニュー、背景・サイドバービットマップ適用 | `ui/menu-iframe.html`, `ui/js/ui/submenu.js` |
| **`shell.md`** | シェル画像、`surfaces.txt`（SERIKO・合成・当たり判定） | **✅ 対応済 (Fully Supported)** | Canvas 2D によるマルチレイヤ合成、SERIKO アニメーションタイムライン、当たり判定 | `crates/ui/src/surfaces/`, `ui/js/surface/` |
| **`translator.md`** | SHIORI 出力テキストの動的加工・翻訳 (OnTranslate) | **⚠️ 設計対応・フック有 (Feasible)** | `OnTranslate` イベントパイプラインを経由したテキストの動的置換・加工処理 | `src-tauri/src/commands/shiori/protocol.rs`, `ui/js/ghost/ghost-shiori.js` |
| **`update.md`** | `homeurl` に基づく `updates2.dau` / `update.dau` ネットワーク更新 | **✅ 対応済 (Fully Supported)** | Rust による `updates2.dau` 解析、MD5 差分ダウンロード、アトミックファイル置換 | `src-tauri/src/commands/update/`, `ui/js/core/app-update.js` |

---

## 2. 結論と今後の拡張方針

1. **完全対応領域 (`balloon.md`, `directory.md`, `ghost.md`, `shell.md`, `update.md`)**:
   - 伺かコアエコシステムの主要機能（ゴースト起動、シェル描画、バルーン表示、ネットワーク更新、ディレクトリ解決）はすべて実装済みであり、デスクトップおよびモバイル（Android）環境の両方で高い互換性を発揮する。
2. **部分対応・拡張領域 (`install.md`, `owner-draw-menu.md`, `translator.md`)**:
   - `install.md` のシェル・プラグイン・ヘッドライン導入拡張、および `translator.md` の外部トランスレータ DLL / WASM プラグイン対応については、現在のフック設計およびサンドボックス基盤をベースに順次拡張可能なアーキテクチャとなっている。
