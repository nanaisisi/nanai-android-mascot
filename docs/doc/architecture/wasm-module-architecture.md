# WASM モジュール設計 & 接続ファサードアーキテクチャ (WASM Module Architecture)

本文書では、TypeScript フロントエンドと Rust WASM コアエンジン (`nanai-core`) 間におけるモジュール分割構造と接続ファサード設計について規定します。

---

## 1. モジュール分割構造 (`ui/ts/core/wasm/`)

従来の単一巨大ファイルであった `wasm-bridge.ts` を関心事分離 (Separation of Concerns) に基づき以下のモジュールへ再構成・モジュール化しました。

```
ui/ts/core/
├── wasm/
│   ├── wasm-types.ts      # WASM C-ABI 輸出関数・オブジェクトの型定義
│   ├── wasm-memory.ts     # WASM インスタンス初期化、メモリ割り当て/解放、文字列転送
│   ├── wasm-sakura.ts     # さくらスクリプトパース & 状態再生バインディング
│   ├── wasm-protocol.ts   # SSTP, FMO, descript.txt, インストール/更新バインディング
│   ├── wasm-layout.ts     # バルーンテキスト自動折り返し・レイアウト演算バインディング
│   └── wasm-surface.ts    # サーフィス合成計画 & 当たり判定 Hit-test バインディング
└── wasm-bridge.ts         # 統合接続ファサード (100% 互換バレルエクスポート)
```

---

## 2. モジュールごとの責務一覧

| モジュール名           | 役割・責務                                | エクスポート API / メソッド                                                          |
| :--------------------- | :---------------------------------------- | :----------------------------------------------------------------------------------- |
| **`wasm-types.ts`**    | WASM C-ABI 共通型定義                     | `SakuraToken`, `SstpRequest`, `BalloonLayoutResult`, `SurfaceCompositionPlan` など   |
| **`wasm-memory.ts`**   | メモリ領域 & 寿命管理                     | `wasmMemory.init()`, `encodeString()`, `decodeString()`, `alloc()`, `free()`         |
| **`wasm-sakura.ts`**   | さくらスクリプト処理                      | `parseSakuraScriptWasm(script)`                                                      |
| **`wasm-protocol.ts`** | 各種プロトコルパース                      | `parseSstpRequestWasm()`, `parseDescriptTextWasm()`, `calculateUpdateProgressWasm()` |
| **`wasm-layout.ts`**   | レイアウト領域の計算                      | `computeBalloonTextLayoutWasm(text, maxWidth, ...)`                                  |
| **`wasm-surface.ts`**  | サーフィス画像レイヤー合成 & ヒットテスト | `findHitCollisionNameWasm()`, `computeSurfaceCompositionPlanWasm()`                  |
| **`wasm-bridge.ts`**   | **統合接続ファサード**                    | `wasmBridge` インスタンス (全モジュールの委譲呼び出し)                               |

---

## 3. 利点と品質の担保

1. **透過性と互換性**:
   - `wasm-bridge.ts` がバレルエクスポートおよびファサードクラスとして機能するため、既存の呼び出し元コードは一切の変更なしで引き続き `wasmBridge.parseSakuraScript(...)` 等の統一 API を利用できます。

2. **堅牢なフォールバック機能**:
   - WASM バイナリの未準備時や fetch エラー時でも、各モジュールが自動的に TypeScript 純正の代替ロジックへ透過切り替えするため、アプリがクラッシュしません。

3. **安全なメモリ・ライフサイクル管理 (FinalizationRegistry の活用と手動 `free()` の両立)**:
   - Rust/WASM (C-ABI) で割り当てられたインスタンスポインタ (`wasm_alloc`、`wasm_create_player` 等) は JavaScript 側からのガベージコレクション (GC) 監視が必要です。
   - ステートマシンなどライフサイクルが長いオブジェクト（例：`SakuraPlayerEngine`）は、ES6 の `FinalizationRegistry` を用いて、JavaScript 側でオブジェクトが破棄されたタイミングで自動的に WASM の `freeSakuraPlayerWasm(ptr)` が呼び出されるよう監視・実装します。
   - 関数スコープ内で完結する処理（文字列エンコード / デコード用バッファ）は `wasmMemory.free()` を手動かつ `try/finally` を用いて確実に開放し、メモリリークを防止します。
   - 参考: [WebAssemblyにおける文字列の受け渡しとメモリ管理の最適化](https://zenn.dev/semiexp/articles/151184c6c5564c)

4. **型安全性の担保と自動型生成 (`tsify`)**:
   - Rust 側で定義された構造体や Enum (例: `SakuraToken`, `SstpRequest`) を TypeScript 側で安全かつ正確に扱うため、`tsify` (または `tsify-next`) クレートの活用を標準とします。
   - `serde` と連携して Rust の型定義から TypeScript のインターフェース定義 (`wasm-types.ts` など) を自動生成することで、シリアライズ/デシリアライズ時の JSON の型の不一致やヒューマンエラーをビルドレベルで完全に排除します。
