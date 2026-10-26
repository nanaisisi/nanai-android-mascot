# ukadoc-spec マニュアル (manual/) 全ページ網羅・突合仕様書

- **参照公式規格リファレンス**: [ukatech/ukadoc-spec: manual (GitHub)](https://github.com/ukatech/ukadoc-spec/tree/main/manual) / [UKADOC Project Web版](https://ukatech.shillest.net/ukadoc-spec/)
- **対象バージョン**: 伺か / SSP 規格仕様
- **権利表記**: © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

本書は、`ukadoc-spec` リポジトリの `manual/` 配下の全マニュアル仕様（`balloon.md`, `directory.md`, `ghost.md`, `install.md`, `owner-draw-menu.md`, `shell.md`, `translator.md`, `update.md`）に基づき、Nanai Android Mascot における各構成・機能の対応状況および実装方針を突合した仕様ドキュメントです。

> [!WARNING]
> 以下の表は旧来の自己申告で、コード根拠が未確認です。コード突合済みの結果は [ukadoc/manual/](../ukadoc/manual/) の各ファイルと [SUMMARY.md](../ukadoc/SUMMARY.md) が正です。
> 突合では translator・owner-draw-menu が未実装、install は Ghost/Balloon のみ対応、update のみ実装済でした。

---

## 1. 総合サマリー & 対応マトリクス

| 分類 / ページ | 対象仕様 | 対応状況 | Nanai 実装・対応方針 |
| :--- | :--- | :---: | :--- |
| `manual/balloon.md` | バルーンの構成・仕様 | ✅ 対応済 | `descript.txt` 属性解釈、フォント/余白/折り返し/原点設定、スコープ別表示 |
| `manual/directory.md` | ディレクトリ構成規格 | ✅ 対応済 | VFS (仮想ファイルシステム) による `ghost/`, `shell/`, `balloon/` の標準配置 |
| `manual/ghost.md` | ゴーストの構成・仕様 | ✅ 対応済 | `ghost/master/` 認識、SHIORI 連携 (WASM/Rust/DLL)、基本イベント発火 |
| `manual/install.md` | NAR・ZIP アーカイブ導入 | ✅ 対応済 | ドラッグ＆ドロップ、`install.txt` (`type,ghost/shell/balloon/plugin`) 仕分け解凍 |
| `manual/owner-draw-menu.md` | オーナードロー右クリックメニュー | ✅ 対応済 | iframe 隔離サンドボックス、シェル連動 CSS テーマ、動的メニューツリー構築 |
| `manual/shell.md` | シェル・サーフィス構成 | ✅ 対応済 | `shell/master/`、`surfaces.txt` (SERIKO/MAYUNA)、マルチレイヤ合成レンダラ |
| `manual/translator.md` | トランスレータ仕様 | ⚠️ 部分対応 | さくらスクリプトプレイヤ内トランスレートフック基盤、スクリプトフィルタ |
| `manual/update.md` | ネットワーク更新仕様 | ✅ 対応済 | `updates2.dau` / `update.dau` 解析、HTTP MD5 差分ダウンロード、自動置換 |

- **全8ページ網羅率**:
  - 対応済 (✅): **7 (87.5%)**
  - 部分対応 (⚠️): **1 (12.5%)**
  - 未対応 (❌): **0 (0%)**

---

## 2. ページ別詳細突合

### 2.1 manual/balloon.md (バルーンの構成・仕様)

- **規格概要**: バルーンを構成する画像ファイル群（`balloons0.png` 等）および `descript.txt` の各種パラメータ定義。
- **Nanai 実装状況**:
  - `descript.txt` によるフォント名、文字色、フォントサイズ、選択肢ハイライト色、文字送り速度のパースと DOM/CSS 反映。
  - `origin.x`, `origin.y`, `validrect`, `wordwrappoint.x` に基づく吹き出しアンカーおよびパディング・折り返し制御。
  - マルチキャラ（`\0`, `\1`, `\p[n]`）ごとの独立バルーンウィンドウ表示。

### 2.2 manual/directory.md (ディレクトリ構成規格)

- **規格概要**: 伺かベースウェアが解釈する標準ディレクトリ構成（`ghost/` 配下の `descript.txt`, `ghost/master/`, `shell/master/`、`balloon/` 等）。
- **Nanai 実装状況**:
  - Android ストレージおよびデスクトップローカル上の仮想ファイルシステム (VFS) で完全サポート。
  - 大文字・小文字の差異（Windows と Linux/Android の差異）を正規化してパス解決。

### 2.3 manual/ghost.md (ゴーストの構成・仕様)

- **規格概要**: ゴースト全体の構造、SHIORI サブシステムとの結合、キャラクタ定義（`\0` 本体と `\1` 相方）。
- **Nanai 実装状況**:
  - `shiori.dll` / WASM / JS SHIORI の動的ロードとライフサイクル管理（`load`, `request`, `unload`）。
  - `OnBoot`, `OnClose`, `OnMouseDoubleClick`, `OnSecondChange` 等の基本イベントルーティング。

### 2.4 manual/install.md (インストール仕様)

- **規格概要**: `.nar`（Nanika Archive）および `.zip` アーカイブによる配布パッケージの規格と `install.txt` のディレクティブ解釈。
- **Nanai 実装状況**:
  - `type` ディレクティブ（`ghost`, `shell`, `balloon`, `plugin`, `headline`）に応じた自動仕分け・展開。
  - `accept` キーによる対応ゴースト判定および既存リソースの上書き/更新ハンドリング。

### 2.5 manual/owner-draw-menu.md (オーナードロー右クリックメニュー)

- **規格概要**: ゴーストやシェルがデザインをカスタマイズ可能な右クリックメニュー。
- **Nanai 実装状況**:
  - Webview / iframe を用いたオーナードロー互換 UI。
  - シェルやバルーンの色調に合わせたスタイリング、シェル選択・着せ替え・設定・終了などの階層メニュー展開。

### 2.6 manual/shell.md (シェル・サーフィス構成)

- **規格概要**: シェル画像、`surfaces.txt` によるサーフィス定義、SERIKO アニメーション、当たり判定定義。
- **Nanai 実装状況**:
  - Canvas 2D によるアニメーション（`base`, `overlay`, `replace` 等）の合成再生。
  - `collision` 領域のタッチ・マウスホバー・クリック判定。

### 2.7 manual/translator.md (トランスレータ仕様)

- **規格概要**: SHIORI が出力したさくらスクリプトをベースウェア側で表示直前に加工・置換する機構。
- **Nanai 実装状況**:
  - さくらスクリプトプレイヤ前段でのフック処理パイプラインを実装。
  - 外部トランスレータ DLL の実行は WASM/JS フィルタとして拡張可能な構造を採用。

### 2.8 manual/update.md (ネットワーク更新仕様)

- **規格概要**: `homeurl` に設置された `updates2.dau`（または `update.dau`）を用いた MD5 チェックサムによる差分更新。
- **Nanai 実装状況**:
  - Rust Tauri バックエンドによる `updates2.dau` の解析。
  - MD5 ハッシュ突合による差分ダウンロード、一時フォルダ検証後の安全なアトミックファイル置換。
