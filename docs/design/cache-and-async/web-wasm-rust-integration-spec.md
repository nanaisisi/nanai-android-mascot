# Web / WASM / Rustクレート連携アーキテクチャ設計

本ドキュメントでは、nanai-android-mascotにおけるWebベースUI（HTML/CSS/JS）、WebAssembly (WASM)、およびネイティブRustクレート間の連携整合性とデータフローを定義します。

---

## 1. 全体アーキテクチャとターゲット整合性

本プロジェクトはデスクトップ（Tauriネイティブ）とAndroid（WebView / Tauri-Android）の両対応、将来的なブラウザ（Pure WASM）動作を視野に入れたポータブル構成を採用します。

```mermaid
graph TB
    subgraph Frontend["Frontend Layer (WebView / Web UI)"]
        UI[Web UI (Vanilla JS / Canvas / DOM)]
        JSGlue[JS Bridge / Tauri IPC Glue]
    end

    subgraph Intermediate["WASM / FFI Boundary"]
        WasmBindgen[wasm-bindgen / UniFFI / Tauri IPC]
        SharedArray[SharedArrayBuffer / Uint8Array Zero-Copy]
    end

    subgraph CoreEngine["Rust Core Engine (No-std / Cross-Platform)"]
        GhostEngine[ghost-engine (ステートマシン・イベントディスパッチャ)]
        SurfaceCompositor[surface-compositor (PNA合成・画像処理)]
        ShioriVM[shiori-vm (スクリプト評価・インタープリタ)]
    end

    subgraph PlatformAdapter["Platform Abstraction Layer (HAL)"]
        NativeFS[Native FS (std::fs / Android JNI)]
        WasmFS[Web Storage / IndexedDB / OPFS]
    end

    UI <--> JSGlue
    JSGlue <--> WasmBindgen
    WasmBindgen <--> CoreEngine
    SurfaceCompositor --> SharedArray
    CoreEngine --> PlatformAdapter
```

---

## 2. クレート設計とターゲット別切り替え方針

Rust側のコードベースはターゲット（`target_os = "android"`、`desktop`、`wasm32-unknown-unknown`）に応じて条件付きコンパイル（Cargo features）を適用します。

### 2.1 コアクレートの切り分け

1. **`nanai-core` (純粋Rustロジック / `no_std` 互換寄り)**
   - プラットフォーム非依存のSHIORIプロトコルパーサー（SHIORI/3.0）。
   - サーフェス定義（`surfaces.txt`）およびゴースト記述ファイル（`descript.txt`）のAST解析。
   - 依存クレート: `nom` / `winnow` (高速パース), `serde`。
2. **`nanai-surface` (画像合成・キャッシュ)**
   - PNAアルファ抜き・パーツ重ね合わせ（`image` クレートまたは軽量なピクセルバッファ操作）。
   - WASM向け: `web-sys` の `CanvasRenderingContext2D` / `OffscreenCanvas` へRawピクセル受け渡し。
   - ネイティブ向け: SIMD最適化またはマルチスレッド合成（Rayon等、WASMでは逐次実行）。
3. **`nanai-storage` (非同期ストレージアダプタ)**
   - ネイティブ/Android: Tokio / `std::fs` + Android Scoped Storageラッパー。
   - Web/WASM: IndexedDB (IDB) / Origin Private File System (OPFS) / Cache API。

---

## 3. Web-WASM間のデータ受け渡し最適化 (ゼロコピー設計)

画像データ（数MB単位のサーフェススプライト）を頻繁にやり取りする際、WASMメモリとJSヒープ間のコピーオーバーヘッドがボトルネックとなります。

### 3.1 ゼロコピー描画パイプライン

1. **WASM Linear Memoryからの直接参照**:
   - Rust側でメモリ内にサーフェス画像を合成し、ピクセル配列（RGBA8888）の先頭ポインタと長さを取得。
   - JS側で `new Uint8ClampedArray(wasmMemory.buffer, ptr, len)` によりWASMメモリを直接ビューイング（参照のみ、コピーなし）。
   - `createImageData` または `ImageData` コンストラクタに渡し、Canvasに `putImageData` で転送。
2. **転送型バイナリ（Transferable Objects）**:
   - Web WorkerからUIスレッドへ画像データを渡す場合は `ArrayBuffer` をTransferableとして転送し、メモリコピーを回避。

---

## 4. SHIORIサブシステムとの非同期結合

SHIORIスクリプトエンジン（YAYA、華和梨、Satoriなど）の互換レイヤーについて、環境ごとの整合性を以下のように担保します。

| 実行環境 | SHIORI実装形態 | 呼び出し方式 | 非同期制御 |
| :--- | :--- | :--- | :--- |
| **Android (Native/Tauri)** | Rust再実装版 or C++共有ライブラリ (`.so`) | JNI / 直接dlopen (Rust FFI) | Tokio非同期タスク上で呼び出し |
| **Web / WASM** | Rust再実装版（WASMコンパイル） or JS版 | Direct Function Call | Promise / async-await |
| **Desktop (Tauri)** | C共有ライブラリ (`.dll` / `.so`) | `libloading` による動的ロード | スレッドプール経由非同期呼出 |

---

## 5. 関連ドキュメント

- [Androidキャッシュ階層構造と非同期アーキテクチャ設計](./android-cache-and-async-architecture.md)
- [実装タスクとマイルストーン](./cache-async-implementation-roadmap.md)
