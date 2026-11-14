# TypeScript型定義の最小化・自動生成活用計画

Rustの構造体から `tsify` および `wasm-pack` によって出力される型定義 (`nanai_core.d.ts`) を活用し、TypeScript側での型の二重管理を解消します。これにより、Rust側の仕様変更時にTypeScript側の型も自動で追従するようになります。

## 課題

現在 `ui/ts/core/wasm/wasm-types.ts` で `SakuraToken` や `SstpRequest` といったドメイン型、およびWASMのエクスポート関数のインターフェース (`NanaiCoreWasmExports`) を手動で定義しています。
一方で、`wasm-pack build` を実行することで `ui/ts/core/wasm/pkg/nanai_core.d.ts` に `tsify` で生成された正確な型定義が出力されています。これら２つが二重管理になっています。

## Proposed Changes

以下の修正を行い、自動生成された型を使用するようにします。

### 1. `wasm-types.ts` のスリム化

自動生成される `nanai_core.d.ts` に存在する型を手書きの `wasm-types.ts` から削除し、再エクスポートするように変更します。

#### [MODIFY] [wasm-types.ts](ui/ts/core/wasm/wasm-types.ts)

- `SakuraToken`, `SstpRequest`, `TextLayoutLine`, `BalloonLayoutResult`, `SurfaceElement`, `SurfaceCompositionPlan`, `DescriptManifest`, `AnimationPattern`, `AnimationDefinition`, `AnimationState` のインターフェース定義を削除
- 代わりに `export type { ... } from "./pkg/nanai_core.js";` を用いて、`nanai_core.d.ts` から直接エクスポートする。
- WASMの関数シグネチャをまとめた `NanaiCoreWasmExports` も、`nanai_core.d.ts` の `InitOutput` を継承・利用する形にするか、直接置き換える。

### 2. 各所からの型インポートの調整

各ファイル（`wasm-bridge.ts`, `wasm-sakura.ts` など）は現在 `wasm-types.ts` に依存しているため、`wasm-types.ts` が再エクスポートする形であれば呼び出し側の変更は最小限で済みますが、一部の型名が変わったりジェネリクスが変化した場合は合わせる必要があります。

#### [MODIFY] [wasm-bridge.ts](ui/ts/core/wasm-bridge.ts)

- `wasm-types.ts` から引き続きインポートするが、実体は `pkg/nanai_core.d.ts`由来となるため、必要に応じて型の不整合を微修正する。

## Verification Plan

### 自動テスト

- `npm run typecheck` を実行し、今回修正したWASMの型周りのエラーが解消・または新しいエラーが出ないことを確認する（※既存のエラーが多数あるため、今回の修正部分の型不整合がないか確認する）。
- `npm run test` （Vitest）を実行し、テストが通過することを確認する。

### 手動確認

- `ui/ts/core/wasm/wasm-types.ts` のコードサイズが最小化され、Rust側で `#[derive(Tsify)]` をつけたものがそのままTS側で活用できていることを確認する。
