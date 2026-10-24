# 次期フェーズ実装計画 & 統合技術仕様書 (Phase 2+)

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

    subgraph CoreBridge ["Tauri / Rust コア仲介層"]
        VFS["VFS & 文字コード変換 (encoding_rs)<br>・Shift_JIS ↔ UTF-8 自動判別<br>・大文字小文字無視パス解決"]
        EventDispatcher["イベントディスパッチャー<br>・OnMouseClick, OnChoiceSelect<br>・OnSecondChange タイマー"]
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
```

---

## 2. 実装計画（マイルストーン別タスク）

### Milestone 1: インタラクション & スクリプトエンジンの完全統合 (Windows First)

**目標**: `mock_nanai` またはローカルゴーストが、タッチ操作に応じて喋り、表情を変え、選択肢を提示する一連のループをブラウザ/デスクトップ上で完結させる。

1. **さくらスクリプト再生キューとサーフィスの完全連動**
   - [x] パーサー・トークナイザー基盤の実装 (`src/js/sakura-script.js`)
   - [ ] `\s[ID]` による [src/js/surface.js](file:///e:/project/rust/nanai-android-mascot/src/js/surface.js) のリアルタイム表情切り替えハンドラ接続
   - [ ] `\w`, `\_w` ウェイトとバルーンタイピング表示の非同期実行
   - [ ] クリックによる全文スキップ機能のバルーンUI組み込み
2. **当たり判定（Collision）からの SHIORI イベント発火**
   - [x] `surfaces.txt` の Collision パースおよび逆算座標計算基盤
   - [ ] 頭部・胸部など各部位タッチ時の `OnMouseClick`（Reference4: 部位ID）生成
   - [ ] 選択肢 `\q[ラベル,ID]` クリック時の `OnChoiceSelect` イベント返送パイプライン構築
3. **定期タイマー（OnSecondChange）とランダムトーク**
   - [ ] 一定間隔（例: 60〜180秒）でのランダムトーク発生ロジック

---

### Milestone 2: 仮想ファイルシステム (VFS) & ゴーストローダー統合

**目標**: 任意の歴史的ゴースト（Shift_JIS記述のZIPまたはフォルダ）を配置・選択し、文字化けなくサーフィスとスクリプトを読み込めるようにする。

1. **Rust 側 VFS コマンドの Tauri 登録**
   - [x] [src/lib.rs](file:///e:/project/rust/nanai-android-mascot/src/lib.rs) での `open_text_file`（UTF-8/Shift_JIS自動変換）および `resolve_vfs_path` 実装
   - [ ] フロントエンド側の `GhostLoader` から Tauri invoke で VFS コマンドを呼び出す繋ぎ込み
2. **大文字・小文字不一致の透過的解決**
   - [ ] `surface0.png` や `Surface0.PNG` 等の参照を Android / Linux 環境でも確実にロード
3. **ゴースト・バルーン着せ替え UI の接続**
   - [ ] 標準右クリックメニューの「シェル」「着せ替え」サブメニューにスキャン結果を反映

---

### Milestone 3: WASM / C++ SHIORI コア実行環境

**目標**: Windows DLL 非依存で、里々 (SATORI) や YAYA 辞書をブラウザ/Android 内で実行可能にする。

1. **SHIORI 3.0 プロトコルレイヤーの標準化**
   - [ ] Request / Response 文字列のヘッダー・ステータスコード整形ユーティリティ
2. **Web Worker サンドボックス SHIORI**
   - [ ] WASM 化された SHIORI エンジンを Web Worker 上で起動し、メインスレッドの UI 描画（アニメーション）をブロックしない非同期呼び出しモデルを構築
3. **JS モック対話エンジン（軽量フォールバック）**
   - [ ] SHIORI バイナリを含まない軽量ゴースト用の JavaScript 簡易対話・イベントハンドラの整備

---

### Milestone 4: Android ネイティブ常駐・オーバーレイ実装

**目標**: Android 実機上で他アプリの上に浮遊常駐し、邪魔にならないスマートなデスクトップマスコット体験を提供する。

1. **Android マニフェスト & パーミッション誘導**
   - [x] `SYSTEM_ALERT_WINDOW` の設定画面誘導インテント呼び出し（Tauriコマンド `request_overlay_permission` & 設定モーダル案内UI）
   - [ ] フォアグラウンドサービス通知チャネルの実装
2. **透過タッチスルー (Touch-through)**
   - [ ] マスコット透過部分のタッチイベントを Android OS の背後ウィンドウへ通過させるネイティブ設定
3. **画面端スナップ & ドッキング UI**
   - [x] [src/js/interaction.js](file:///e:/project/rust/nanai-android-mascot/src/js/interaction.js) による端寄せドッキングと復帰の CSS アニメーション

---

## 3. 仕様検討課題（未解決論点と対応方針）

### 検討課題 A: 複数キャラクター（0番: sakura / 1番: kero）の描画レイアウト

- **現状**: 現在のキャンバス描画は sakura（本体）1体のみを想定。
- **対応方針**:
  - `SurfaceManager` をマルチインスタンス化し、キャラID（0, 1）ごとの独立した描画コンテキストまたは複数 `<canvas>` を保持。
  - スクリプト中の `\0` / `\1` タグに応じて対象のバルーンとキャラを切り替える。

### 検討課題 B: Canvas 合成のパフォーマンス最適化

- **現状**: 毎フレーム全体再描画するとモバイル端末のバッテリー消費が増加する。
- **対応方針**:
  - アニメーション（まばたき等）がない間はタイマー描画を停止（ダーティフラグ管理）。
  - レイヤー構造（静的な Base レイヤーと動的な Overlay レイヤー）を分離し、変化部分のみを差分合成。

### 検討課題 C: モバイルでの右クリック代替 UX

- **現状**: デスクトップでは右クリックで標準伺かメニューを表示。
- **対応方針**:
  - 長押し（Long Press: 600ms）または 2本指タップでメニューをトグル。
  - 画面上部の固定クイックボタンからの展開もサポート。

---

## 4. ドキュメント相互参照

- [PROJECT-SPEC.md](file:///e:/project/rust/nanai-android-mascot/PROJECT-SPEC.md) - プロジェクト全体仕様書
- [TODO.md](file:///e:/project/rust/nanai-android-mascot/TODO.md) - 詳細タスクチェックリスト
- [docs/sakura-script-and-balloon-spec.md](file:///e:/project/rust/nanai-android-mascot/docs/sakura-script-and-balloon-spec.md) - さくらスクリプト & バルーン仕様
- [docs/surfaces-and-collision-spec.md](file:///e:/project/rust/nanai-android-mascot/docs/surfaces-and-collision-spec.md) - サーフィス合成 & 当たり判定仕様
- [docs/encoding-and-vfs-spec.md](file:///e:/project/rust/nanai-android-mascot/docs/encoding-and-vfs-spec.md) - 文字コード & VFS 仕様
- [docs/android-overlay-and-service-spec.md](file:///e:/project/rust/nanai-android-mascot/docs/android-overlay-and-service-spec.md) - Android 常駐・オーバーレイ仕様
