# 各論6：WASM採用におけるブラウザ依存・メモリ解放の課題と現実的対策

本ドキュメントでは、WebAssembly (WASM) 採用時における**ブラウザ環境依存**および**メモリ解放（デアロケーション）の課題**を詳細に分析し、回避策および「Native Rust 直接実行（Tauri ホスト側）」との比較検討を行います。

---

## 1. WASM 採用時の主な課題・リスク

### 1.1 メモリ解放（デアロケーション）の厄介さ
- **`memory.shrink` の不在**:
  - WASM のリニアメモリ（`WebAssembly.Memory`）は拡張（`grow`）できますが、**縮小（`shrink`）できません**。
  - Rust 側で `drop()` を呼んでも、それは WASM ヒープ内（`dlmalloc` 等）で再利用可能になるだけであり、ブラウザ/OSに確保された `ArrayBuffer` は**ピーク時のサイズのまま占有**されます。
- **循環参照・JSオブジェクトハンドルの保持**:
  - `wasm-bindgen` を通じて JS 側のクロージャや DOM ハンドル (`JsValue`) を WASM 側で保持すると、手動で `.free()` を明示的に呼別ない限り、JS の GC（ガベージコレクタ）からも回収されずメモリリークの原因となります。
- **ArrayBuffer の離脱 (Detachment)**:
  - WASM 内でメモリが拡張されると、JS 側で参照していた既存の `ArrayBuffer` が即座に無効化（Detached）されるため、毎回ビューを再生成する慎重な実装が必要です。

### 1.2 ブラウザ / WebView 環境依存の多さ
- **シングルスレッド制約と WebWorker ハンドリング**:
  - ブラウザ/WebView 標準の WASM は基本的にメインスレッド（シングルスレッド）で動作します。マルチスレッド化（`SharedArrayBuffer` / `Atomics`）を導入するには、COOP/COEP ヘッダー設定やブラウザ互換性のハードルが高くなります。
- **`web-sys` バインディングのオーバーヘッド**:
  - WASM から `web-sys` を経由して頻繁に DOM や Canvas を操作すると、境界を跨ぐ呼出コスト（JS/WASM 境界のブリッジオーバーヘッド）が発生します。

---

## 2. 対策案：WASM 継続 vs Native Rust (Tauri Host) への移行比較

もし WASM のメモリ管理やブラウザ依存が過度なボトルネックとなる場合、**重いロジックを Native Rust (Tauri ホスト側) に直接寄せる** という設計判断も非常に有効です。

| 評価項目 | パターンA: WASM ハイブリッド (WebView内) | パターンB: Native Rust 直接実行 (Tauri Host側) |
| :--- | :--- | :--- |
| **メモリ解放** | 縮小不可。WebWorker 解体 (`terminate`) が必要 | **標準の Rust `drop()` で OS に即時返却可能** |
| **スレッド・並列処理** | WebWorker や SharedArrayBuffer の制約あり | **`tokio` / `rayon` / マルチスレッドが制限なしで使用可能** |
| **ブラウザ依存度** | 高い (`web-sys`, `wasm-bindgen`) | **低い (Tauri IPC 境界のみ)** |
| **Web互換性 (ブラウザ単体動態)** | 完全な Web アプリとして単体動作可能 | Desktop / Android アプリ専用（要Tauri環境） |
| **描画・バッファ転送** | `WebAssembly.Memory` の `Uint32Array` 直読み | Tauri IPC / カスタムプロトコル / Native Canvas 転送 |

---

## 3. 現実的な設計指針（ベストプラクティス）

1. **WASM を使用する場合の厳格ルール**:
   - **大容量処理の WebWorker 孤立化**: 大容量の解凍や画像処理は使い捨ての WebWorker で実行し、完了後に `worker.terminate()` でメモリをまるごと破棄。
   - **`JsValue` の保持を最小化**: WASM 内で JS オブジェクトの参照を持ち越さず、数値・文字列プリミティブや生ポインタでやり取りする。
2. **Native Rust (Tauri Host) へのオフロード判断**:
   - サーフィスバッファの重いピクセル処理や大容量アーカイブの展開は、**Native Rust 側（`src-tauri` / crates）で実行**し、結果の画像や状態通知のみを UI に渡す構成にすることで、WASM のメモリ問題とブラウザ依存を回避可能。
