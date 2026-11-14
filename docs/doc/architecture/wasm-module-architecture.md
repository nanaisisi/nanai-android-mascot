# WASM モジュール設計 & 接続ファサードアーキテクチャ (WASM Module Architecture)

本文書では、TypeScript フロントエンドと Rust WASM コアエンジン (`nanai-core`) 間におけるモジュール分割構造と接続ファサード設計について規定します。

## ⚠️ 次期開発AIエージェントへの引き継ぎ事項 (Context For Lightweight LLMs)

本プロジェクトは、過去に存在した複雑なTypeScript製のパーサーや状態マシンをすべてRust (WASM) へ完全移行し終えています。
**以下のディレクトリやファイルは既に完全に削除・廃止済みであり、検索や編集を試みないでください。**
- `ui/ts/ghost/parser/` (TS製さくらスクリプト/タグパーサー)
- `tests/sakura-ast.test.ts`, `tests/tag-tokenizer.test.ts`, `tests/parser-fuzzing/` 等の関連レガシーテスト
- TS側の古い型定義 (`wasm-types.ts` 内の手書き定義など)

今後のパースロジック、再生エンジン、SERIKOアニメーションの追加・修正は**すべて Rust 側の `crates/nanai-core/src/` 配下 (`sakura_script.rs`, `sakura_player.rs`, `surfaces_parser.rs` など)** で行ってください。TypeScript側はUI描画とWASMの呼び出しブリッジのみを担当します。

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
| **`wasm-types.ts`**    | WASM C-ABI 共通型定義 (再エクスポート)    | `nanai_core.d.ts` の型をそのまま再エクスポート (手動定義なし)                        |
| **`wasm-memory.ts`**   | メモリ領域 & 寿命管理                     | `wasmMemory.init()`, `getWasmCore()`                                                 |
| **`wasm-sakura.ts`**   | さくらスクリプト処理                      | `parseSakuraScriptWasm(script)`, `createSakuraPlayerWasm(script)` 等                 |
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

3. **安全なメモリ・ライフサイクル管理 (`FinalizationRegistry` を基軸とした自動・手動解放の統合)**:
   - Rust/WASM (`wasm-bindgen` / C-ABI) で割り当てられたヒープオブジェクトやインスタンス（例: `SakuraPlayerEngine` などのステートマシン）は、JavaScript 側の GC と連動してメモリ領域を返還する必要があります。
   - **`FinalizationRegistry` による自動クリーンアップ**:
     - JavaScript の JS ラッパーオブジェクトが GC によって回収された際、WASM ヒープ上のメモリ（Rust 側のインスタンス）が確実に解放されるよう `FinalizationRegistry` を標準の解放メカニズムとして採用します。
     - これにより、JavaScript 側で明示的な `.free()` 呼び出しを忘れた場合でも、メモリリークを発生させずに自動的に `wasm_free` / `.free()` が実行される安全網（Safety Net）を構築します。
   - **決定論的な手動 `.free()` の併用**:
     - ループ内や高頻度な更新処理など、即座にメモリを返還したい短寿命なオブジェクト/バッファ領域については、`try / finally` ブロックによる明示的な `.free()` 呼び出しを優先し、GC のタイミングに依存しない決定論的なメモリ解放を行います。
   - 参考: [WebAssemblyにおける文字列の受け渡しとメモリ管理の最適化](https://zenn.dev/semiexp/articles/151184c6c5564c)

4. **型安全性の担保と自動型生成 (`tsify`)**:
   - Rust 側で定義された構造体や Enum (例: `SakuraToken`, `SstpRequest`) を TypeScript 側で安全かつ正確に扱うため、`tsify` (または `tsify-next`) クレートの活用を標準とします。
   - `serde` と連携して Rust の型定義から TypeScript のインターフェース定義 (`wasm-types.ts` など) を自動生成することで、シリアライズ/デシリアライズ時の JSON の型の不一致やヒューマンエラーをビルドレベルで完全に排除します。
