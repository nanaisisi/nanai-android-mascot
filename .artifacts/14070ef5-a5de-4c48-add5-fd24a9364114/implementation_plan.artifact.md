# フェーズ 6: バルーン descript.txt プロパティ検証 & 推薦ゴースト判定パーサーの実装計画

本計画は、UKADOC/SSP 仕様における **バルーンスキン (balloon) の `descript.txt`** プロパティ解析（推薦ゴースト・パスの検証、フォント設定、マージン・validrect等のパース）を `crates/nanai-core/src/balloon_descript.rs` として新規実装し、WASM 経由でフロントエンドから高速に検証・適用するための設計方針です。

---

## 提案する変更内容 (Proposed Changes)

### 1. `crates/nanai-core/src/balloon_descript.rs` の新規作成
- **BalloonDescriptValidator 構造体**:
  - `recommended_ghost`: Option<String>
  - `recommended_ghost_path`: Option<String>
  - `validrect`: Option<(i32, i32, i32, i32)>
  - `margins`: Option<(i32, i32, i32, i32)>
  - `is_recommended(current_ghost_name: &str, current_ghost_path: &str) -> (bool, Option<String>)` (推薦ゴーストとの突合チェックおよびUKADOC準拠の警告メッセージ生成)
- **WASM エクスポート (`#[wasm_bindgen]`)**:
  - `wasm_validate_balloon_descript` を公開。

### 2. TypeScript 側バインディングの追加
- `ui/ts/core/wasm/wasm-layout.ts`（または `wasm-protocol.ts`）に `validateBalloonDescriptWasm` を追加。

---

## 検証計画 (Verification Plan)

### 自動テスト
- `cargo test -p nanai-core` によるバルーンdescript検証の単体テスト実行。
- `npm test`（Vitest）によるフロントエンドテストの実行。
