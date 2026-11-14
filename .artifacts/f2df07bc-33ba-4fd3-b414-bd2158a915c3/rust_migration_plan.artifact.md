# Rustへの大部分移行計画（アーキテクチャ検討報告書）

本ドキュメントでは、nanai-android-mascot プロジェクトにおけるコアロジックおよびフロントエンド処理の **Rust / WASM への大部分移行** に関する設計方針、代替案、およびメモリ管理・分担戦略について総括します。

---

## 1. 総論 (General Remarks)

### 移行の目的
- **パフォーマンスとメモリ効率の極限追求**: さくらスクリプトの高速パース、ASTトラバーサル、セリコ（SERIKO）アニメーションのフレーム演算、ピクセルバッファ合成（SurfaceFrameBuffer）における GC プレッシャーの削減。
- **型安全性と保守性の統一**: Rust の強力な所有権システムとコンパイル時保証を、フロントエンドのコアロジックやステート管理にまで拡張する。
- **クロスプラットフォーム（デスクトップ・モバイル・XR）の堅牢性**: プラットフォーム固有の差異を Rust バックエンドで吸収し、UI レイヤーを薄く保つ。

---

## 2. 概案 (Overview)

現状の Tauri + TypeScript 構成から、**「重い計算・状態機械・パース・描画計算を Rust/WASM に集約し、TypeScript はピュアな DOM/UI レンダリングとイベント配給に徹する」** という方針に軸足を移します。

- **バックエンド (Tauri Rust)**: システム統合、IPC、ファイルI/O、ウィンドウ管理、音声・ネットワーク。
- **コアエンジン (WASM / Rust)**: SHIORIプロトコルハンドラ、さくらスクリプトパーサー/プレーヤー状態機械、アニメーション演算、サーフィス合成バッファロジック。
- **フロントエンド (TypeScript / DOM / Compose)**: UIコンポーネント、イベントリスナー、CSSスタイリング、DOMバインディング。

---

## 3. 各案の比較 (Alternative Approaches)

| 比較項目 | 案A: フルRustフロントエンド化 (Yew / Dioxus) | 案B: ハイブリッドWASM/Rust移行 (推奨) | 案C: 段階的オフロード (現状維持 + 部分WASM) |
| :--- | :--- | :--- | :--- |
| **概要** | UIも含めてすべて Rust (WASM) で構築 | コアロジックを WASM に集約し、UIはTSのまま | 既存TSコードを活かしつつボトルネックのみWASM化 |
| **パフォーマンス** | 最高（DOM操作も仮想DOM/Rust側） | 極めて高い（計算・パースが高速化） | 部分的 |
| **開発コスト** | 非常に高い（既存UIコードの全面書き換え） | 中程度（TS/DOMバインディングのインターフェース設計） | 低い |
| **エコシステム活用** | Web標準UIライブラリの制限あり | 既存の豊富なWeb/Tauri/UIエコシステムを維持可能 | 既存資産をそのまま活用 |
| **推奨度** | 低 (リスク大) | **高 (現実的かつ高性能)** | 中 (移行途中段階) |

---

## 4. TS / WASM / Rust の分担 (Division of Labor)

```mermaid
graph TD
    subgraph TypeScript (UI Layer)
        UI[DOM / Web Components / Rendering]
        Events[User Gestures / Input Events]
    end

    subgraph WASM (Core Engine - Rust)
        Parser[Sakura Script Parser & AST]
        Player[Playback State Machine & Timers]
        Compositor[Surface FrameBuffer & Blend Engine]
    end

    subgraph Tauri / Rust Backend
        IPC[IPC / FFI / System Bridge]
        Shiori[SHIORI DLL / Plugin Loader]
        Storage[Assets / File I/O]
    end

    UI --> Events
    Events -->|Async IPC / WASM Calls| Player
    Player -->|AST & State Updates| UI
    Parser --> Player
    Compositor -->|Pixel Buffers| UI
    Player --> Shiori
    Shiori --> IPC
    Storage --> Compositor
```

1. **TypeScript (UI / Presentation Layer)**
   - DOM 要素の生成、更新、CSS アニメーション、UI インタラクション（ドラッグ、タッチ、メニュー）。
   - WASM コアから受け取った描画指令やテキスト差分を画面に反映。
2. **WASM / Rust (Core Logic & State Machine)**
   - さくらスクリプトの字句・構文解析（AST生成）、プレーヤーの再生ループ、ウェイト制御。
   - サーフィスのピクセルバッファ操作（`SurfaceFrameBuffer` の 32bit ビュー、ブレンディング、HLS色変換）。
3. **Tauri / Rust Backend (System & Host)**
   - ネイティブウィンドウ管理、OS間通信、SHIORI DLL のロードと実行、ファイルシステムアクセス。

---

## 5. WASM の TS(JS) 連携とメモリ管理 (Memory Management & Interop)

WASM と TypeScript 間で大量のバイナリデータ（画像ピクセルバッファなど）や複雑な構造体をやり取りする場合、パフォーマンス低下やメモリリークを防ぐための設計が不可欠です。

### ① メモリ共有とゼロコピー（Zero-Copy）戦略
- **Shared ArrayBuffer / Uint8Array / Uint32Array**:
  - 画像フレームバッファ（RGBA）などは、WASM側のメモリー空間（`WebAssembly.Memory`）を TypeScript 側から `Uint32Array` としてダイレクトに参照（ビューを共有）することで、コピーコストをゼロにする。
- **ポインタの受け渡し**:
  - 大きな配列はポインタとサイズをJS側に返し、JS側でラップして操作。

### ② 所有権とライフサイクル管理
- **WASM側でのアロケーションと明示的解放**:
  - Rust側（`wasm-bindgen`）で確保したヒープメモリ（画像バッファや一時ASTオブジェクトなど）は、利用終了時に明示的な `free()` / `destroy()` メソッドを提供し、JSのGC頼みによるメモリ肥大化を防止。
- **WeakMap / Cache 連携**:
  - WASMインスタンスとJS側ラッパー間でオブジェクト参照が周回する場合、`WeakMap` を用いて循環参照によるメモリリークを回避。

### ③ シリアライズの最小化
- 頻繁に呼び出される高頻度ループ（毎フレームのアニメーション計算や文字送りなど）では、JSONシリアライズ（`serde_json` の `to_string` / `from_str`）を避け、**数値プリミティブの直接返却**や**メモリバッファ直接読み書き**を採用する。

---

## 6. 結論と次のステップ

- **推奨方針**: **案B (ハイブリッドWASM/Rust移行)** を採用し、パース、スクリプト再生状態機械、ピクセル合成などの重い計算処理を段階的に Rust 化して WASM としてコンパイル・統合する。
- **ロードマップ**:
  1. コアパーサーおよびサーフィス合成ロジックの Rust 実装強化 (`nanai-core-wasm`)。
  2. メモリ共有レイヤー（`Uint32Array` バッファビュー）の最適化。
  3. TypeScript フロントエンドとのインターフェース定義 (`wasm-bindgen` / TypeScript 型定義自動生成)。
