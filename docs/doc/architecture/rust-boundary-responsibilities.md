# 各論5：Web側 (TS/JS) ⇔ WASM (Rust) ⇔ アプリ側 (Native Rust) の役割分担と境界設計

本ドキュメントでは、Webフロントエンド (TypeScript/JS)、WebAssembly空間 (Rust WASM)、およびアプリケーション本体 (Native Rust Host) の3層における **全体像**、**Web同士の関係 (TS ⇔ WASM)**、**Rust同士の関係 (WASM ⇔ Native Rust)** の役割分担と通信メカニズムについて詳細に解説します。

---

## 1. 3層アーキテクチャの全体像 (Overall Architecture)

```mermaid
graph TD
    subgraph Layer1["1. Web Frontend Layer (WebView / Browser)"]
        TS["TypeScript / JS (UI / DOM)<br>- DOM / CSS レンダリング<br>- ユーザー入力・ジェスチャーの検知<br>- ダイアログ / メニュー UI 状態"]
        WASM["Rust WASM Core Engine<br>- さくらスクリプト解析 / AST 評価<br>- SERIKO アニメーション評価<br>- サーフィス画素合成 (FrameBuffer)"]
    end

    subgraph Layer2["2. Native App Host Layer (OS / Rust Backend)"]
        Host["Native Rust Host (Tauri App)<br>- OS ウィンドウ管理 (Tauri / tao / wry)<br>- VFS / ZIP アーカイブファイルアクセス<br>- SHIORI / SAORI DLL (C-FFI / プロセス通信)<br>- OS システムトレイ / Android Bridge"]
    end

    TS <-->|"① Web同士: メモリ共有 / ダイレクト呼び出し<br>(wasm-bindgen / Zero-Copy Buffer)"| WASM
    TS <-->|"② Web ⇔ Host: 非同期 IPC / イベントエミッター<br>(Tauri invoke / tauri-specta)"| Host
    WASM <.-.->"③ Rust同士: 型・ドメインモデルの完全共有<br>(nanai-core 共通クレート / serde)"| Host
```

---

## 2. Web同士の関係：TypeScript (JS) ⇔ WASM (Rust)

Web フロントエンド（WebView）内での TypeScript と WASM (Rust) の関係性です。

### 2.1 役割分担

- **TypeScript (JS)**:
  - **純粋なビューおよびイベント配給層 (View & Event Dispatcher)**:
    - DOM 要素の動的生成、CSS クラスやスタイルの適用、レイアウト管理。
    - マウス、タッチ、キーボードなどのユーザー入力を検知し、前処理（デバウンス等）を行った上で WASM 側へ伝達。
- **WASM (Rust)**:
  - **ドメインロジック & 高速演算エンジン (Model & Computation Engine)**:
    - さくらスクリプトの字句・構文解析（AST 生成）。
    - SERIKO アニメーションタイマーの管理およびフレーム計算。
    - サーフィスフレームバッファ（`SurfaceFrameBuffer`）に対する 32bit ピクセル操作・ブレンディング演算。

### 2.2 データ共有と通信方式

- **ゼロコピー共有メモリ (Zero-Copy Shared Memory)**:
  - 大容量の画像ピクセルデータ（RGBA）などは、コピーを行わずに `WebAssembly.Memory` を通じて TS 側の `Uint32Array` / `Uint8ClampedArray` からポインタ参照でダイレクトに操作・レンダリング。
- **バインディング技術 (`wasm-bindgen` / `web-sys`)**:
  - TS から WASM 内の演算関数（例: `wasmEngine.evaluateFrame(timestamp)`）を同期/非同期で直接呼び出し。
  - WASM からブラウザ標準機能（Canvas 2D Context, `requestAnimationFrame`, `AudioContext`）を `web-sys` 経由で型安全かつ直接制御。

---

## 3. Rust同士の関係：WASM (Rust) ⇔ アプリ本体 (Native Rust)

WebAssembly 空間内で動作する Rust と、OS 上のネイティブプロセスとして動作する Tauri / Host Rust の関係性です。

### 3.1 役割分担

- **Host App (Native Rust)**:
  - **OS / 特権・プラットフォーム供給層 (Platform & System Host)**:
    - マルチウィンドウの生成・配置・透過制御（Tauri/tao/wry）。
    - ローカルファイルシステムや VFS（ZIP アーカイブからのゴーストアセット解凍・供給）。
    - C++ FFI / DLL 制御（SHIORI.DLL や SAORI の直接ロードおよび stdio ブリッジ経由の通信）。
    - OS 通知、システムトレイ、Android Bridge 連携。
- **WASM (Rust)**:
  - **サンドボックス型アプリケーションコア (Sandboxed App Core)**:
    - Host から提供されたアセットバイナリや SHIORI レスポンス文字列を受け取り、ゴーストの状態機械や演出ロジックを非同期に駆動。

### 3.2 通信・型共有メカニズム

- **型とデータモデルの 100% 共有 (`nanai-core` 共通クレート)**:
  - SHIORI リクエスト/レスポンス構造体、Surface 属性、アニメーション定義などの型を `nanai-core` などの共通クレートを通じて Rust 同士で完全に一元定義。
- **非同期 IPC ブリッジ (Tauri IPC / Specta)**:
  - WASM（WebView サンドボックス内）と Host Rust（OS ネイティブ）間は Tauri の IPC (`invoke` / `emit`) で接続。
  - `tauri-specta` を導入することで、IPC 境界におけるデータ構造の型整合性がコンパイル時に 100% 保証される。

---

## 4. 全体としての相乗効果 (Synergy) とメリット

1. **JS/TS ⇔ WASM (Rust) の相乗効果**:
   - DOM / CSS の柔軟な表現力と、Rust による GC フリーな爆速計算力の両立。
2. **WASM (Rust) ⇔ Native Rust の相乗効果**:
   - サンドボックスの安全性と、OS 特権・FFI・ファイル操作能力の両立。共通クレートによる言語・型システムの完全統一。
3. **改変性と保守性**:
   - View (TS/DOM)、Domain Core (WASM/Rust)、System Host (Native Rust) の 3 層が疎結合化され、単体テスト・モジュール単位での改変・機能拡張が極めて容易。
