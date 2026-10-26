# 次期フェーズ実装計画 & 統合技術仕様書 (Phase 2+)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **バルーン仕様 (Balloon)**: [ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

本ドキュメントは、**nanai-android-mascot** の基盤技術仕様（課題1〜4：さくらスクリプト制御、サーフィス合成・当たり判定、文字コード/VFS、Android常駐基盤）の策定完了を受け、これらを統合して本格稼働させるための **実装計画（ロードマップ）および詳細仕様** を定義します。

---

## 1. 全体アーキテクチャ統合図

フロントエンド（Web/JS）、Tauri/Rust 仲介層、および SHIORI コア／Android ネイティブ層の責務境界を以下のように定義します。

```mermaid
flowchart TD
    subgraph UI ["フロントエンド (Web / Single Container)"]
        CanvasLayer["サーフィス描画エンジン (Canvas 2D)<br>・Base/Overlayレイヤー合成<br>・アニメーションタイマー"]
        TouchRouter["タッチ/当たり判定ルーター<br>・surfaces.txt collision 逆算判定<br>・なで/つつき イベント生成"]
        ScriptEngine["さくらスクリプト再生エンジン<br>・トークナイザー & キュー制御<br>・文字送り / ウェイト / 早送りスキップ"]
        BalloonUI["バルーン UI<br>・\\q 選択肢動的生成<br>・吹き出し追従"]
        MenuUI["伺か標準メニュー / 設定モーダル"]
    end

    subgraph CoreBridge ["Tauri / Rust コア仲介層 (crates/ui & src-tauri)"]
        VFS["VFS & 文字コード変換 (encoding_rs)<br>・Shift_JIS ↔ UTF-8 自動判別<br>・大文字小文字無視パス解決"]
        EventDispatcher["イベントディスパッチャー<br>・OnMouseClick, OnChoiceSelect<br>・OnSecondChange タイマー"]
        RustParsers["Rust コアパーサー・プロトコル層<br>・surfaces.txt / マニフェスト解析<br>・さくらスクリプト解析 (AST生成)<br>・SHIORI/3.0 プロトコル制御"]
    end

    subgraph Backend ["バックエンド / プラットフォーム連携"]
        WasmShiori["WASM SHIORI / C++ FFI<br>(里々 / YAYA / JSモック)"]
        AndroidNative["Android 常駐・オーバーレイ<br>(SYSTEM_ALERT_WINDOW / タッチ透過)"]
    end

    CanvasLayer <--> TouchRouter
    TouchRouter -->|部位付きイベント| EventDispatcher
    EventDispatcher -->|SHIORI 3.0 Request| WasmShiori
    WasmShiori -->|SHIORI 3.0 Response| ScriptEngine
    ScriptEngine --> BalloonUI
    ScriptEngine -->|\\s[ID] 表情切り替え| CanvasLayer
    CanvasLayer <--> VFS
    EventDispatcher <--> AndroidNative
    ScriptEngine -.->|パース移譲| RustParsers
    CanvasLayer -.->|定義取得| RustParsers
```

---

## 2. 実装計画（マイルストーン別タスク）

### Milestone 1: インタラクション & スクリプトエンジンの完全統合 (Windows First)

**目標**: `mock_nanai` またはローカルゴーストが、タッチ操作に応じて喋り、表情を変え、選択肢を提示する一連のループをブラウザ/デスクトップ上で完結させる。

1. **さくらスクリプト再生キューとサーフィスの完全連動**
   - [x] パーサー・トークナイザー基盤の実装 (`src/js/sakura-script.js`)
   - [x] `\s[ID]` による [src/js/surface.js](../../../ui/js/surface/surface.js) のリアルタイム表情切り替えハンドラ接続
   - [x] `\w`, `\_w` ウェイトとバルーンタイピング表示の非同期実行
   - [x] クリックによる全文スキップ機能のバルーンUI組み込み
2. **当たり判定（Collision）からの SHIORI イベント発火**
   - [x] `surfaces.txt` の Collision パースおよび逆算座標計算基盤
   - [x] 頭部・胸部など各部位タッチ時の `OnMouseClick`（Reference4: 部位ID）生成
   - [x] 選択肢 `\q[ラベル,ID]` クリック時の `OnChoiceSelect` イベント返送パイプライン構築
3. **定期タイマー（OnSecondChange）とランダムトーク**
   - [x] 一定間隔（例: 60〜180秒）でのランダムトーク発生ロジック（[src/js/ghost.js](../../../ui/js/ghost/ghost.js)）

---

### Milestone 2: 仮想ファイルシステム (VFS) & ゴーストローダー統合

**目標**: 任意の歴史的ゴースト（Shift_JIS記述のZIPまたはフォルダ）を配置・選択し、文字化けなくサーフィスとスクリプトを読み込めるようにする。

1. **Rust 側 VFS コマンドの Tauri 登録**
   - [x] [src-tauri/src/lib.rs](../../../src-tauri/src/lib.rs) での `open_text_file`（UTF-8/Shift_JIS自動変換）および `resolve_vfs_path` 実装
   - [x] フロントエンド側からの Tauri invoke によるアセット・surfaces.txt パス解決（[src/js/surface.js](../../../ui/js/surface/surface.js)）
2. **大文字・小文字不一致の透過的解決**
   - [x] `surface0.png` 等のフォールバック・小文字正規化ロード対応
3. **ゴースト・バルーン着せ替え UI の接続**
   - [x] 標準右クリックメニューの「シェル」「着せ替え」サブメニューにスキャン結果を反映（[src/menu-iframe.html](../../../ui/menu-iframe.html) & [src/js/context-menu.js](../../../ui/js/ui/context-menu.js)）

---

### Milestone 3: WASM / C++ SHIORI コア実行環境

**目標**: Windows DLL 非依存で、里々 (SATORI) や YAYA 辞書をブラウザ/Android 内で実行可能にする。

1. **SHIORI 3.0 プロトコルレイヤーの標準化**
   - [x] Request / Response 文字列のヘッダー・ステータスコード整形ユーティリティ（[src/js/shiori-protocol.js](../../../ui/js/ghost/shiori-protocol.js)）
2. **Web Worker サンドボックス SHIORI**
   - [x] WASM 化された SHIORI エンジンを Web Worker 上で起動し、メインスレッドの UI 描画をブロックしない非同期呼び出しモデルを構築（[src/js/shiori-worker.js](../../../ui/js/ghost/shiori-worker.js)）
3. **JS モック対話エンジン（軽量フォールバック）**
   - [x] SHIORI バイナリを含まない軽量ゴースト用の JavaScript 簡易対話・イベントハンドラの整備（[src/js/ghost.js](../../../ui/js/ghost/ghost.js)）

---

### Milestone 4: Android ネイティブ常駐・オーバーレイ実装

**目標**: Android 実機上で他アプリの上に浮遊常駐し、邪魔にならないスマートなデスクトップマスコット体験を提供する。

1. **Android マニフェスト & パーミッション誘導**
   - [x] `SYSTEM_ALERT_WINDOW` の設定画面誘導インテント呼び出し（Tauriコマンド `request_overlay_permission` & 設定モーダル案内UI）
   - [x] フォアグラウンドサービス通知チャネルの実装（Tauriコマンド `setup_foreground_service`）
2. **透過タッチスルー (Touch-through)**
   - [x] マスコット透過部分のタッチイベント透過（[src/css/base.css](../../../ui/css/base.css) の `.container: pointer-events: none` & `.ghost-display: pointer-events: auto` 分離）
3. **画面端スナップ & ドッキング UI**
   - [x] [src/js/interaction.js](../../../ui/js/surface/interaction.js) による端寄せドッキングと復帰の CSS アニメーション

---

### Milestone 5: ハードコード廃止と設定・定数管理のモジュール化

**目標**: パス文字列、初期ゴースト名、タイマー値などのハードコードを廃止し、設定駆動・動的スキャン優先のアーキテクチャへ刷新する。

1. **設定・定数モジュール（`src/js/config.js`）の一元化**
   - デフォルトアセットパス、フォールバックゴースト、タイマー間隔、UI規定倍率・制限値などを集約。
   - LocalStorage との同期および動的オーバーライドの提供。
2. **ゴースト・シェルパス解決の動的化**
   - `GhostController` 内の文字列直書き（`assets/ghost/...`）を排除し、スキャン結果のパス情報および VFS 解決を標準化。
   - 起動時の初期ゴーストをスキャン結果の先頭またはユーザー設定から動的に選択。
3. **SHIORI ワーカー・対話データの外部化・構造化**
   - `shiori-worker.js` 内のハードコードされたセリフ群を設定・辞書データ構造として分離。

---

### Milestone 6: アーカイブ取り込み（NAR / ZIP）とゴースト動的導入

**目標**: ユーザーが `.nar` や `.zip` の配布アーカイブを取り込み、安全に解凍・インストールして即時切り替え可能にする。

1. **アーカイブ解凍・パストラバーサル防止基盤**
   - [src-tauri/src/lib.rs](../../../src-tauri/src/lib.rs) の `install_ghost_archive` Tauriコマンド。
   - `install.txt`（Shift_JIS / UTF-8 両対応）の自動パースによるゴースト名・展開ディレクトリ判定。
   - Zip Slip 脆弱性を防止するパス正規化と安全なディレクトリ解決。
2. **メニュー導線 & 取り込みモーダル UI**
   - 右クリックメニュー（[src/menu-iframe.html](../../../ui/menu-iframe.html) & [src/js/context-menu.js](../../../ui/js/ui/context-menu.js)）への「ファイル取り込み・導入 (I)」項目追加。
   - 取り込み専用モーダル（[src/index.html](../../../ui/index.html) & [src/js/modal.js](../../../ui/js/ui/modal.js)）およびゴースト管理モーダルからの 2 系統の取り込み UI 連携。
   - 取り込み完了後のゴースト一覧再スキャン・自動選択・バルーン通知パイプライン。

---

### Milestone 7: コア解析・プロトコル処理の Rust 移行と二重実装解消

**目標**: フロントエンド（JS）とバックエンド（Rust `crates/ui`）で重複しているパーサー・プロトコルロジックを Rust コアに一元化し、WebView の責務を描画と UI インタラクションに特化させる。

1. **パーサー・マニフェスト処理の Rust 移譲**
   - `surface-parser.js` および `shell-manifest.js` の解析処理を `crates/ui`（`surfaces.rs`, `manifest.rs`）へ統合。
   - Tauri Command 経由で構造化データ（JSON / IPC）としてフロントへ渡す構成へ変更。
2. **さくらスクリプト解析（AST・コマンドキュー）の一元化**
   - `sakura-parser.js` の構文解析を Rust 側（`crates/ui/src/script.rs`）に移行。
   - フロントエンド（`sakura-script.js`）は解析済みコマンドのキュー消化（ディスパッチとウェイト制御）のみを担当。
3. **SHIORI プロトコル制御の Rust 移譲**
   - `shiori-protocol.js` を `crates/ui/src/shiori.rs` と一本化。
   - ネイティブ DLL やプロセス間通信、WASM 呼び出しなどの SHIORI セッションを Rust コア側で管理。
4. **SERIKO アニメーション計算の連携**
   - `crates/ui/src/animation.rs` によるタイムライン事前計算を活用し、JS 側はスケジュールされたフレーム描画に専念。

---

### 検討課題 A: 複数キャラクター（0番: sakura / 1番: kero）の描画レイアウト

- **現状**: sakura（0番）および kero（1番）の独立コンテナ・スコープ別バルーン・掛け合い対話対応済み。
- **対応方針**:
  - `GhostController.updateSurface` および `SakuraScriptPlayer` により、`\0` / `\1` タグに応じたスコープ別の表情・バルーン制御を実装完了。
  - 今後アニメーション差分合成をマルチインスタンス化する際も、各コンテナ独立のキャンバス構造で分離可能。

### 検討課題 B: Canvas 合成のパフォーマンス最適化

- **現状**: 現在は `<img>` 要素ベースで静的表示しており、CPU/GPU 負荷およびバッテリー消費は最小限に抑制。
- **対応方針**:
  - 将来的な `element` / `animation` レイヤー合成時も、アニメーション更新のないフレームでは `requestAnimationFrame` や再描画ループを実行しない「オンデマンド描画（ダーティフラグ管理）」を採用。
  - まばたき等の差分（Overlay レイヤー）のみを透明キャンバスで重ね合わせることで、モバイル端末でのバッテリー消費を最小化する。

### 検討課題 C: モバイルでの右クリック代替 UX

- **現状**: デスクトップでは右クリックで標準伺かメニューを表示。
- **対応方針**:
  - 長押し（Long Press: 600ms）または 2本指タップでメニューをトグル（[src/js/interaction.js](../../../ui/js/surface/interaction.js) に実装完了）。
  - 画面上部の固定クイックボタンからの展開もサポート（実装完了）。

---

## 4. ドキュメント相互参照

- [PROJECT-SPEC.md](../../../PROJECT-SPEC.md) - プロジェクト全体仕様書
- [TODO.md](../../../TODO.md) - 詳細タスクチェックリスト
- [docs/spec/sakura-script-and-balloon-spec.md](../../spec/shiori-script/sakura-script-and-balloon-spec.md) - さくらスクリプト & バルーン仕様
- [docs/spec/surfaces-and-collision-spec.md](../../spec/ghost/surfaces-and-collision-spec.md) - サーフィス合成 & 当たり判定仕様
- [docs/spec/encoding-and-vfs-spec.md](../../spec/platform/encoding-and-vfs-spec.md) - 文字コード & VFS 仕様
- [docs/spec/android-overlay-and-service-spec.md](../../spec/platform/android-overlay-and-service-spec.md) - Android 常駐・オーバーレイ仕様
