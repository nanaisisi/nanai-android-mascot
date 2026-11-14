# Tauri API から WASM / Web 環境への移行およびビルド時条件分岐仕様書

## 概要

本ドキュメントは、Tauri API に依存しているフロントエンド / Rust ロジックを WASM (WebAssembly) および Web / ブラウザ環境へ移行・共存させるための設計アプローチおよび、Rust / Cargo におけるビルド時（コンパイル時）の機能分岐手法をまとめた調査・設計ノートです。

---

## 1. Tauri API から WASM / Web 環境への移行性

### 1.1 課題と前提
* `@tauri-apps/api` や `@tauri-apps/plugin-*` は、Tauri の Native Backend (Rust IPC) との通信 (`window.__TAURI_INTERNALS__` 等) を前提としています。
* WASM 単体または純粋な Web ブラウザ環境では Tauri IPC が存在しないため、直接呼び出すと失敗します。

### 1.2 移行・共存のための 3 つの設計パターン

#### パターン A: アダプター (Bridge) パターンによる抽象化
Tauri API の直接呼び出しを隠蔽し、インターフェース層経由で環境に応じた実装を注入します。

```ts
// 例: StorageAdapter インターフェース
export interface StorageAdapter {
  readFile(path: string): Promise<Uint8Array>;
}

// Tauri 用実装
export class TauriStorageAdapter implements StorageAdapter {
  async readFile(path: string): Promise<Uint8Array> {
    const { readFile } = await import("@tauri-apps/plugin-fs");
    return await readFile(path);
  }
}

// WASM / Web 用実装 (OPFS / IndexedDB / WASM FS)
export class WasmStorageAdapter implements StorageAdapter {
  async readFile(path: string): Promise<Uint8Array> {
    // OPFS または IndexedDB から読み込み
    return await readFromOPFS(path);
  }
}
```

#### パターン B: `invoke()` を WASM バインディング (`wasm-bindgen`) 直接呼出へ置き換え
Rust 側のコアロジックを `wasm-pack` でコンパイルし、Tauri の IPC を経由せず直接 WASM 関数として呼び出します。

* **Tauri 呼び出し**: `const res = await invoke("parse_nar", { bytes });`
* **WASM 呼び出し**: `const res = wasmModule.parse_nar(bytes);`

#### パターン C: Web 標準 API でのフォールバック
Tauri Native 機能は以下の Web 標準 API に置き換えることができます。

| Tauri API / Plugin | Web / WASM 環境での代替手段 |
| :--- | :--- |
| `@tauri-apps/plugin-dialog` | `<input type="file">` または File System Access API (`showOpenFilePicker`) |
| `@tauri-apps/plugin-fs` | OPFS (Origin Private File System) / IndexedDB / Memory FS |
| `@tauri-apps/api/event` | `CustomEvent` (`window.dispatchEvent`) |
| `@tauri-apps/api/window` | CSS ベースの擬似ウィンドウ制御 / HTML5 Fullscreen API |

---

## 2. WASM ビルドにおけるコンパイル時 (ビルド時) 機能分岐

Rust / Cargo では、WASM ビルド時に OS・アーキテクチャ・機能（Feature Flag）ごとにコードや依存クレートを完全に切り替える（不要コードを消去する）ことが可能です。

### 2.1 ターゲットアーキテクチャ分岐 (`#[cfg(...)]`)
Native 環境 (Windows / macOS / Android 等) と WASM (`wasm32`) 環境でコンパイルするコードを分離します。

```rust
// WASM 向けの処理
#[cfg(target_arch = "wasm32")]
pub fn log_message(msg: &str) {
    web_sys::console::log_1(&msg.into());
}

// Native (Windows/Android/Linux) 向けの処理
#[cfg(not(target_arch = "wasm32"))]
pub fn log_message(msg: &str) {
    println!("[Native Log]: {}", msg);
}
```

### 2.2 Cargo Feature による機能フラグ分岐
用途（Web用, TauriBridge用, フル機能版 等）に合わせてビルド時に機能の有効/無効を指定できます。

`Cargo.toml`:
```toml
[features]
default = ["web"]
web = ["dep:web-sys"]
tauri-bridge = []
full-audio = []

[dependencies]
serde = "1.0"
web-sys = { version = "0.3", optional = true, features = ["Console"] }
```

Rust コード:
```rust
#[cfg(feature = "tauri-bridge")]
pub fn tauri_bridge_init() { ... }

#[cfg(feature = "web")]
pub fn web_init() { ... }
```

ビルドコマンド例:
```bash
# Web用
wasm-pack build crates/nanai-core --target web -- --features web

# Tauri ブリッジ用
wasm-pack build crates/nanai-core --target web -- --no-default-features --features tauri-bridge
```

### 2.3 ターゲットごとの依存関係の分離 (`[target.'cfg(...)'.dependencies]`)
WASM ビルド時のみ必要なクレートと、Native ビルド時のみ必要なクレートを分離定義します。

`Cargo.toml`:
```toml
[target.'cfg(target_arch = "wasm32")'.dependencies]
wasm-bindgen = "0.2"
web-sys = { version = "0.3", features = ["Window", "Document"] }

[target.'cfg(not(target_arch = "wasm32"))'.dependencies]
tokio = { version = "1.0", features = ["fs"] }
```

---

## 3. 本プロジェクト (`nanai-android-mascot`) への適用指針

1. **`crates/nanai-core` などのコアクレートの共通化**
   * Native (Tauri) と WASM の両方で動作するように `#[cfg(target_arch = "wasm32")]` や Cargo Feature を活用する。
2. **`ui/ts/core/tauri-helper.ts` の拡張**
   * 既存の `isTauriAvailable()` 判定を利用し、Tauri 未検出時には WASM バインディングおよび Web API (OPFS / File API) へ透過的にフォールバックするアダプター層を整備する。

---

## 4. Android 環境における WASM 利用パターンと特徴

Android アプリケーション内での WASM 活用には、主に以下の 2 つのアプローチが存在します。

### 4.1 パターン A: Android WebView (UI側) 内で WASM を実行する (フロントエンド WASM)
Android アプリの画面を表示する `WebView` (Tauri for Android や標準の Android WebView) 内部で、JavaScript と共に `.wasm` バイナリを実行します。

* **特徴・メリット**:
  * PC ブラウザ向けに生成された `.wasm` バイナリ (`wasm32-unknown-unknown`) を、クロスコンパイルなしでそのまま Android WebView 上でも再利用可能。
  * Android NDK などの高度なネイティブビルド環境を設定・保守しなくても、コアロジック（SHIORI エンジン解析や計算モジュール等）をプラットフォーム共通化できる。
* **モバイル最適化の観点**:
  * モバイル環境のメモリ制限（OOM）に配慮するため、Cargo Feature (`features = ["mobile-target"]`) などで WASM の初期メモリ確保量や並列度を低めに調整・コンパイル分岐する。

### 4.2 パターン B: Android Native (Rust / NDK) 側で WASM ランタイムを埋め込む (バックエンド WASM)
WebView を介さず、Android Native (Rust / NDK / JNI) 側に `wasmtime` や `wamr` (WebAssembly Micro Runtime) などの WASM ランタイムを組み込みます。

* **特徴・メリット**:
  * ユーザー定義の動的プラグインやサードパーティ製 SHIORI スクリプト等を、サンドボックス化された安全な環境で動的にロード・実行可能。

### 4.3 組み込み (Embedded WASM) 向けビルド時条件分岐の利点
実行時に JS や WASM 内部で `if (isAndroid)` などの環境判定を行うのではなく、**コンパイル時 (Cargo Feature) に特定プラットフォーム向けコードに固定化された WASM バイナリを切り出して生成する**手法が推奨されます。

* **デッドコードの完全削減 (Dead Code Elimination)**: 非対象 OS / プラットフォーム用の処理や依存ライブラリが LLVM コンパイラによって WASM バイナリから削除され、最小かつ最速の WASM ファイルが生成される。
* **コンパイル時の型安全性**: 組み込み先プラットフォーム非対応の処理が含まれた場合にビルドエラーとして検知できる。

```bash
# 例: Android 組み込み専用 WASM の生成
wasm-pack build crates/nanai-core --target web \
  --out-dir ../../ui/ts/core/wasm/pkg-android \
  -- --no-default-features --features target-android

# 例: Desktop / PC 組み込み専用 WASM の生成
wasm-pack build crates/nanai-core --target web \
  --out-dir ../../ui/ts/core/wasm/pkg-desktop \
  -- --no-default-features --features target-desktop
```

### 4.4 ネイティブハイブリッド構成における結論
本プロジェクトは純粋な Web ブラウザ単体運用ではなく、**Native 依存の WebView (Tauri for Android / Native WebView) + Native (Rust / NDK) のハイブリッド構成**です。

コアロジック (`nanai-core`) を WASM 適用可能クレートとして設計し、`target-android` / `target-desktop` の Feature Flag でコンパイル分岐することで：
1. **Desktop ハイブリッド**: Tauri (Rust Native) IPC または WebView 上の高速演算用 WASM (`target-desktop`)
2. **Android ハイブリッド**: Tauri for Android / Android Native WebView 上での軽量処理用 WASM (`target-android`)
の両ターゲットに対して、完全に最適化されたネイティブハイブリッド実行基盤を提供できます。



