# マニュアル仕様 (ukadoc-spec/manual/) 実ファイルハンドリング対応評価マトリクス (Manual File Handling Support Matrix)

- **参照公式仕様**: [ukatech/ukadoc-spec: manual](https://github.com/ukatech/ukadoc-spec/tree/main/manual)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../developer/strict-code-verification-system.md)

本ドキュメントは、`ukadoc-spec/manual/` 配下の各マニュアル仕様書（テキスト解析に留まらず、**実際のフォルダ構造やファイル群をいかに発見し、ロード・合成・適用して適切にハンドリングするか**）に対する Nanai Android Mascot の実ファイル対応状況を再確認・評価した公式マトリクスである。

---

## 1. マニュアル別 実ファイルハンドリング対応マトリクス

| 規格マニュアルファイル | 対象ディレクトリ・ファイル構造 | 実ファイルハンドリング対応状況 | 実装方式・ファイル処理の詳細 |
| :--- | :--- | :---: | :--- |
| **`manual/balloon.md`** (`balloon/`) | `balloons*.png`, `balloonk*.png`, `balloonp*`, `.pna`, `*s.txt`, `descript.txt` | **✅ 対応済 (一部フォールバック拡充中)** | `load_balloon_image` により `balloons0.png` / `balloonk0.png` を VFS 経由で取得し、CSS 9-slice 背景画像として描画。`.pna` マスクおよび個別オプション (`*s.txt`) の適用経路を統合。 |
| **`manual/directory.md`** | `ghost/`, `shell/`, `balloon/` 標準ディレクトリ階層 | **✅ 対応済 (Fully Supported)** | VFS（仮想ファイルシステム）および大文字小文字を吸収するパス解決。`userData/ghost` と `local/ghost` の優先順位付き走査を実装。 |
| **`manual/ghost.md`** | `ghost/master/`, `descript.txt`, SHIORI DLL / .so | **✅ 対応済 (Fully Supported)** | ゴーストディレクトリ内の構造走査、`descript.txt` 読込、プラットフォーム別 (Windows/Android) SHIORI 実行ファイルの動的ロード。 |
| **`manual/install.md`** | `.nar` / `.zip` アーカイブ, `install.txt` | **⚠️ 部分対応 (Partially Supported)** | `.nar` / `.zip` の安全な展開（ZipSlip防止）、`ghost` および `balloon` 型アーカイブの自動配置。 |
| **`manual/owner-draw-menu.md`** | メニュー背景・前景・サイドバービットマップ | **⚠️ 部分対応 (Partially Supported)** | Webview/iframe による高機能メニュー UI。ゴースト提供のオーナードロー用ビットマップの動的読込・スタイリング。 |
| **`manual/shell.md`** | `shell/master/`, `surfaces.txt`, `surface*.png`, `surface*.pna` | **✅ 対応済 (Fully Supported)** | `load_surface_image` / `load_surface_pna` による 24bit PNG/BMP および 8bit PNA マスクの読み込み・Canvas 2D レイヤ合成。 |
| **`manual/translator.md`** | トランスレータ用外部スクリプト/DLL 連携 | **⚠️ 設計対応・フック有 (Feasible)** | `OnTranslate` イベントパイプラインを経由したさくらスクリプトの動的置換・加工処理の基盤を実装。 |
| **`manual/update.md`** | `updates2.dau`, `update.dau`, 差分ファイル群 | **✅ 対応済 (Fully Supported)** | `homeurl` からの `updates2.dau` 取得・パース、MD5 チェックサム突合による差分ファイルの安全なダウンロードとアトミック置換。 |

---

## 2. 実ファイルハンドリングにおける強みと今後の拡張

1. **実ファイル・アセットの堅牢な VFS 解決 (`directory.md`, `ghost.md`, `shell.md`, `balloon.md`)**:
   - 伺か特有の大文字小文字の混在や、異なるベースウェア（MATERIA/SSP/CROW）間のパス規則の違いを、Rust 製 VFS および Tauri コマンド群が完全に吸収。
   - `surface*.png` や `surface*.pna`（アルファマスク）、`balloons0.png` / `balloonk0.png` などのバイナリリソースを Base64 またはピクセルバッファとしてロスなく UI 層へ引き渡し。
2. **ネットワーク・アーカイブ実ファイル処理 (`update.md`, `install.md`)**:
   - `updates2.dau` 等のテキスト定義パースだけでなく、実際に差分ファイルをダウンロードしてストレージ上に安全に配置する一連のライフサイクルが確立されている。
