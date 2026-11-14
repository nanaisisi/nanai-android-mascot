# TypeScriptからRust(WASM)への移植計画

TypeScriptの型管理等の負担を軽減するため、指定されたTypeScript(TS)の実装をRustへ移植し、WASM経由で利用する形にリファクタリングします。

## 対象ファイル一覧

今回の移植において関連する TypeScript ファイルおよび Rust ファイルのリストです。

### TS実装ファイル (移植対象および削除予定)

- `ui/ts/ghost/sakura-tokenizer.ts` (WASM呼び出しへ置き換え)
- `ui/ts/ghost/parser/tag-tokenizer.ts` (Rustへ移植・削除予定)
- `ui/ts/ghost/parser/tag/escape.ts` (`\&` など) (Rustへ移植・削除予定)
- `ui/ts/ghost/parser/tag/text-format.ts` (`\_u`, `\_m` など) (Rustへ移植・削除予定)
- `ui/ts/ghost/parser/tag/interactive.ts` (`\__q` など) (Rustへ移植・削除予定)
- `ui/ts/ghost/parser/tag/display.ts` (Rustへ移植・削除予定)
- `ui/ts/ghost/parser/tag/scope-surface.ts` (Rustへ移植・削除予定)
- `ui/ts/ghost/parser/tag/skip.ts` (Rustへ移植・削除予定)
- `ui/ts/ghost/parser/tag/wait.ts` (Rustへ移植・削除予定)

### TSテストファイル (Rustへの移植対象および削除予定)

- `tests/parser-fuzzing/cycle6-syntax.test.ts`
- `tests/sakura-tokenizer/raw-mode.test.ts`
- `tests/sakura-tokenizer/tokens-ast.test.ts`
- `tests/sakura-tokenizer/rust-bridge.test.ts`
- `tests/sakura-tokenizer/ast-advanced.test.ts`
- `tests/sakura-tokenizer/post-message.test.ts`
- `tests/sakura-tokenizer/ast-traversal.test.ts`
- `tests/sakura-tokenizer/fallback-tags.test.ts`
- `tests/sakura-tokenizer/tag-edge-cases.test.ts`
- `tests/sakura-tokenizer/bracket-escaping.test.ts`

### Rust側実装ファイル (変更・追加先)

- `crates/nanai-core/src/sakura_script.rs` (WASMバインディングと追加タグのパース実装)

## 移植手順 (Procedure)

1. **Rust実装の拡張**
   `crates/nanai-core/src/sakura_script.rs` にて、現在 TS 側にしか実装されていない以下の Cycle 6 拡張構文等のパース処理を追加します。
   - Unicode/ASCIIエスケープ: `\_u[0x...]`, `\_m[0x...]`
   - XMLエンティティ: `\&[amp]` 等
   - 選択肢スコープ: `\__q[ID,...]...\__q`

2. **Rust側でのテストコード追加**
   上記の拡張構文に対応する単体テスト(`#[test]`)を `sakura_script.rs` の `mod tests` 内に追加し、Rust側の実装が正しく機能することを保証します。

3. **TSテストファイルからWASM呼び出しへの切り替え (動作確認)**
   `sakura-tokenizer.ts` の `parseSakuraScript` の実装を、WASM (`wasm_parse_sakura_script`) の呼び出しへ差し替えます。既存の `tests/` 下のテストを実行し、テストが通ることを確認します。

4. **TSテストファイルの削除 (Clean-up)**
   TS側に残っていた単体テストファイルを削除します (Rust側の `#[test]` によってカバーされるため)。

5. **TS実装ファイルの削除 (Clean-up)**
   不要になった `ui/ts/ghost/parser/tag/` 配下の TS ファイルと `tag-tokenizer.ts` などを削除します。

## Proposed Changes

### さくらスクリプト パーサー (SakuraScript Parser)

#### [MODIFY] [sakura_script.rs](crates/nanai-core/src/sakura_script.rs)

- 移植対象のロジック (`\_u`, `\_m`, `\&`, `\__q` など) の追加とWASMバインディングの実装。
- 同ファイル内の `mod tests` にテストコードを移植。

#### [MODIFY] [sakura-tokenizer.ts](ui/ts/ghost/sakura-tokenizer.ts)

- TypeScript によるフォールバック実装を削除し、WASMモジュールへの委譲処理に差し替えます。

#### [DELETE] [tag-tokenizer.ts](ui/ts/ghost/parser/tag-tokenizer.ts)

#### [DELETE] `ui/ts/ghost/parser/tag/*.ts`

#### [DELETE] 対象のTSテストファイル (`tests/sakura-tokenizer/*.test.ts` 等)

## Verification Plan

### Automated Tests

- `cargo test` によるRust側ロジックの検証
- WASMを組み込んだ後のフロントエンドのテスト実行（`npm run test` 等）

### Manual Verification

- フロントエンド上で実際の処理（例えば特定のスクリプト実行）が従来通り動作するか確認
