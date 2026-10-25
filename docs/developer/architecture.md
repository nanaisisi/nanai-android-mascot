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

> **AI 関与について**: このドキュメントは GitHub Copilot / Antigravity の支援により作成・更新されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。

# システムアーキテクチャ - Nanai Android Mascot

## 1. 概要

Nanai Android Mascot は、Tauri v2 + Rust をコアブリッジとし、フロントエンドにモダンな Web 標準技術（HTML5 Canvas 2D / CSS3 / Vanilla JavaScript）を採用したクロスプラットフォーム・デスクトップマスコット環境です。

---

## 2. 全体アーキテクチャ図

```mermaid
flowchart TB
    subgraph Frontend ["フロントエンド層 (WebView / Single Container)"]
        direction TB
        MainUI["メインビュー (index.html)<br>透過キャンバス & キャラクターコンテナ"]
        ContextMenu["右クリックメニュー (menu-iframe.html)<br>伺か標準階層メニュー"]
        ModalUI["管理モーダル (modal-manager.js)<br>設定 / ゴースト一覧 / デバッグ"]
        
        Canvas2D["サーフィス描画 (surface.js)<br>Canvas 2D レイヤー合成 / Collision逆算"]
        ScriptEngine["さくらスクリプトエンジン (sakura-script.js)<br>トークナイズ / キュー制御 / タイピング"]
        GhostState["ゴースト状態管理 (ghost.js)<br>タイマー / ランダムトーク / スコープ管理"]
        Interaction["操作制御 (interaction.js)<br>ドラッグ / スワイプ / 画面端スナップ"]
        
        ShioriWorker["SHIORI ワーカー (shiori-worker.js)<br>WebAssembly (WASM) / JSモック"]
    end

    subgraph TauriBridge ["Tauri / IPC ブリッジ層 (Rust)"]
        direction TB
        Commands["Tauri Commands<br>open_text_file, resolve_vfs_path, scan_ghosts"]
        Events["Tauri Event Dispatcher<br>ウィンドウ制御 / ショートカット / トレイ"]
    end

    subgraph BackendCore ["バックエンド・ネイティブ層 (Rust 2024)"]
        direction TB
        VFS["VFS & 文字コード変換 (encoding_rs)<br>Shift_JIS ↔ UTF-8 自動判別 / 表記揺れ解決"]
        GhostScanner["ゴーストスキャナー (GhostManager)<br>descript.txt / surfaces.txt 走査"]
        PlatformNative["プラットフォーム抽象化<br>Windows透過ウィンドウ / Androidオーバーレイ"]
    end

    MainUI <--> ContextMenu
    MainUI <--> ModalUI
    MainUI --- Canvas2D
    MainUI --- ScriptEngine
    MainUI --- GhostState
    MainUI --- Interaction
    ScriptEngine <--> ShioriWorker

    Frontend <-->|Tauri IPC (invoke / emit)| TauriBridge
    TauriBridge <--> BackendCore
```

---

## 3. レイヤー構成と責務

### 3.1 フロントエンド層 (`src/`)

- **`index.html`**:
  - 単一の Activity / Window 内で透過表示されるメインコンテナ。
  - キャラクター（\0 sakura, \1 kero）の DOM 要素、Canvas、バルーン吹き出しを保持。
- **`src/js/surface.js`**:
  - `surfaces.txt` のパースおよび HTML5 Canvas 2D によるベース画像＋アニメーション差分レイヤーの合成。
  - 現在の表示倍率（シェルスケール）に応じた当たり判定（Collision）逆算座標計算。
- **`src/js/sakura-script.js`**:
  - `\0`, `\1`, `\s[ID]`, `\w[N]`, `\q[ラベル,ID]`, `\e` 等のタグを字句解析（トークナイズ）。
  - タイピングアニメーション、ウェイト制御、表情連動、全文早送りスキップキューの非同期管理。
- **`src/js/ghost.js`**:
  - ゴーストのメタデータ、状態、定期タイマー（`OnSecondChange`）およびランダムトークのトリガー制御。
- **`src/js/interaction.js`**:
  - マウスドラッグ、モバイルタッチスワイプ、画面端ドッキング退避アニメーション。
- **`src/js/shiori-worker.js` & `shiori-protocol.js`**:
  - SHIORI 3.0 プロトコルのヘッダーパース・構築。
  - Web Worker によるサンドボックス化された SHIORI 実行（メインスレッドをブロックしない非同期処理）。
- **`menu-iframe.html`**:
  - 伺か標準の右クリックメニュー。iframe 分離により、メイン描画とスタイル干渉を起こさずセキュアに動作。

### 3.2 Tauri IPC & バックエンド層 (`src-tauri/`)

- **仮想ファイルシステム (VFS) & 文字コード変換**:
  - `encoding_rs` を用いて、歴史的な伺かアセット（Shift_JIS / CP932）とモダン環境（UTF-8）を自動判別して透過読込。
  - Windows と Linux/Android で異なるファイル名の大文字小文字表記揺れを透過解決。
- **Tauri Commands**:
  - `open_text_file(path)`: 自動文字コード判別付きテキスト取得。
  - `resolve_vfs_path(base, relative)`: 大文字小文字を許容する安全なパス解決。
  - `scan_ghosts()`: インストール済みゴーストディレクトリの巡回取得。

---

## 4. SHIORI 連携の多層フォールバック機構

多様な環境（Windows / Android / Web）において確実にゴーストを動作させるため、SHIORI のロード機構は以下の順序で多層フォールバックします。

1. **Win32 ネイティブ DLL (Windows 環境)**:
   - 既存の 32bit/64bit ネイティブ DLL（`satori.dll`, `yaya.dll`）をロード。
2. **WASM SHIORI (Android / Web / クロスプラットフォーム)**:
   - WebAssembly にコンパイルされた SHIORI エンジンを Web Worker 内で実行。
3. **内蔵 JS/TS 簡易フォールバック**:
   - ネイティブバイナリが存在しない環境でも、辞書テキスト（`dic_*.txt` 等）を直接解釈して基本対話を継続。
4. **モダン Web プラグイン**:
   - JavaScript / Web 標準 API を利用した本アプリ専用の拡張機能。
