# ukadoc-spec マニュアル (manual/) 全ページ網羅・突合仕様書

- **参照公式規格リファレンス**: [ukatech/ukadoc-spec: manual (GitHub)](https://github.com/ukatech/ukadoc-spec/tree/main/manual) / [UKADOC Project Web版](https://ukatech.shillest.net/ukadoc-spec/)
- **対象バージョン**: 伺か / SSP 規格仕様
- **権利表記**: © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

本書は、`ukadoc-spec` リポジトリの `manual/` 配下の全マニュアル仕様（`balloon.md`, `directory.md`, `ghost.md`, `install.md`, `owner-draw-menu.md`, `shell.md`, `translator.md`, `update.md`）に基づき、Nanai Android Mascot における各構成・機能の対応状況および実装方針を突合した仕様ドキュメントです。

> [!WARNING]
> 2026-10-28 のコード突合で、install は Ghost/Balloon のみ対応、translator・owner-draw-menu・plugin・headline は未実装または部分対応、
> `local/ghost` と `userData/ghost` の優先スキャン契約も未実装であることを確認しました。
> 旧来の対応率は進捗目安として扱い、以下ではコードで確認できた範囲と計画上の目標を分離します。

---

## 1. 総合サマリー & 対応マトリクス

| 分類 / ページ               | 対象仕様                         |  対応状況   | Nanai 実装・対応方針                                                             |
| :-------------------------- | :------------------------------- | :---------: | :------------------------------------------------------------------------------- |
| `manual/balloon.md`         | バルーンの構成・仕様             |  ✅ 対応済  | `descript.txt` 属性解釈、フォント/余白/折り返し/原点設定、スコープ別表示         |
| `manual/directory.md`       | ディレクトリ構成規格             |  ✅ 対応済  | VFS (仮想ファイルシステム) による `ghost/`, `shell/`, `balloon/` の標準配置      |
| `manual/ghost.md`           | ゴーストの構成・仕様             |  ✅ 対応済  | `ghost/master/` 認識、SHIORI 連携 (WASM/Rust/DLL)、基本イベント発火              |
| `manual/install.md`         | NAR・ZIP アーカイブ導入          |  ⚠️ 部分対応 | `.nar` / `.zip` の Ghost/Balloon 導入、Zip Slip 防止。Shell/Plugin/Headline の `type` は未対応 |
| `manual/owner-draw-menu.md` | オーナードロー右クリックメニュー |  ⚠️ 部分対応 | iframe のメニューUIは存在するが、ゴースト提供のオーナードロー仕様との完全互換は未検証 |
| `manual/shell.md`           | シェル・サーフィス構成           |  ✅ 対応済  | `shell/master/`、`surfaces.txt` (SERIKO/MAYUNA)、マルチレイヤ合成レンダラ        |
| `manual/translator.md`      | トランスレータ仕様               | ❌ 未実装 | 外部トランスレータ仕様に準拠した登録・実行機構は未実装。内部プレイヤーの拡張余地のみ |
| `manual/update.md`          | ネットワーク更新仕様             |  ✅ 対応済  | `updates2.dau` / `update.dau` 解析、HTTP MD5 差分ダウンロード、自動置換          |
- **コード突合済みの分類（8ページ）**:
  - 対応済 (✅): **4**
  - 部分対応 (⚠️): **3**
  - 未対応 (❌): **1**
  - これは仕様全体の適合率ではなく、各マニュアル領域を現行コードで確認した分類です。

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
  - デスクトップの `assets/ghost` / `assets/balloon` を中心に VFS と大文字・小文字吸収のパス解決を実装。
  - `local/ghost` と `userData/ghost` を優先する公開契約は、現行の `scan_ghost_directory` では未実装。

### 2.3 manual/ghost.md (ゴーストの構成・仕様)

- **規格概要**: ゴースト全体の構造、SHIORI サブシステムとの結合、キャラクタ定義（`\0` 本体と `\1` 相方）。
- **Nanai 実装状況**:
  - `shiori.dll` / WASM / JS SHIORI の動的ロードとライフサイクル管理（`load`, `request`, `unload`）。
  - `OnBoot`, `OnClose`, `OnMouseDoubleClick`, `OnSecondChange` 等の基本イベントルーティング。

### 2.4 manual/install.md (インストール仕様)

- **規格概要**: `.nar`（Nanika Archive）および `.zip` アーカイブによる配布パッケージの規格と `install.txt` のディレクティブ解釈。
- **Nanai 実装状況**:
  - `type` ディレクティブは `ghost` と `balloon` のみ受理し、それぞれ `assets/ghost` / `assets/balloon` へ展開。
  - `shell`, `plugin`, `headline` の仕分け、`accept` による対象判定、専用の上書き・更新処理は未実装。

### 2.5 manual/owner-draw-menu.md (オーナードロー右クリックメニュー)

- **規格概要**: ゴーストやシェルがデザインをカスタマイズ可能な右クリックメニュー。
- **Nanai 実装状況**:
  - Webview / iframe を用いたアプリ側メニューUIと階層メニューは実装済み。
  - ゴーストが提供するオーナードロー定義を解釈して描画する完全互換は未検証。

### 2.6 manual/shell.md (シェル・サーフィス構成)

- **規格概要**: シェル画像、`surfaces.txt` によるサーフィス定義、SERIKO アニメーション、当たり判定定義。
- **Nanai 実装状況**:
  - Canvas 2D によるアニメーション（`base`, `overlay`, `replace` 等）の合成再生。
  - `collision` 領域のタッチ・マウスホバー・クリック判定。

### 2.7 manual/translator.md (トランスレータ仕様)

- **規格概要**: SHIORI が出力したさくらスクリプトをベースウェア側で表示直前に加工・置換する機構。
- **Nanai 実装状況**:
  - さくらスクリプトプレイヤ内部の処理フックは存在する。
  - 外部トランスレータ DLL/WASM/JS の登録・実行を規格準拠で行う機構は未実装。

### 2.8 manual/update.md (ネットワーク更新仕様)

- **規格概要**: `homeurl` に設置された `updates2.dau`（または `update.dau`）を用いた MD5 チェックサムによる差分更新。
- **Nanai 実装状況**:
  - Rust Tauri バックエンドによる `updates2.dau` の解析。
  - MD5 ハッシュ突合による差分ダウンロード、一時フォルダ検証後の安全なアトミックファイル置換。
