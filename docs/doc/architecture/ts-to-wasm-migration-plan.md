# TypeScript から WASM (Rust) への網羅的移行計画

本ドキュメントは、Nanai Android Mascot において、現在 TypeScript で実装されているコアロジック（パーサー、再生エンジン、合成エンジン等）を Rust (WASM) に移行し、TypeScript の責務を「UI・DOMの描画とブラウザAPIのブリッジ」に純化するための網羅的なロードマップです。

## 目的 (Goal)
1. **パフォーマンスの向上**: Rustの高速な処理系によるパース・描画・計算の高速化。
2. **コードの単一情報源 (SSOT) 化**: デスクトップ版（Tauri）とWeb版のコアロジックを Rust クレート (`nanai-core`, `nanai-surface` 等) に完全統一。
3. **保守性の向上**: TypeScript 側の複雑な状態管理クラスやパーサーを削除し、コードベースを大幅に削減。型の二重管理を解消。

---

## 移行フェーズとステータス

### フェーズ 1: 型定義の自動生成と連携 【✅ 完了】
- **内容**: Rust の `#[derive(Tsify)]` を用いて WASM の型定義 (`nanai_core.d.ts`) を自動生成し、TypeScript 側で手動管理していた型（`wasm-types.ts`）を削減・再エクスポートに切り替える。
- **成果**: 型定義の二重管理が解消され、Rust 側の変更が自動的に TS 側に反映されるようになった。

### フェーズ 2: パーサー群の WASM 完全移行 【🚧 進行中】
- **内容**: `surfaces.txt`, `descript.txt`, さくらスクリプトなどのパース処理を完全に WASM に委譲し、TS 側のレガシーパーサーを削除する。
- **対応状況**:
  - `surfaces.txt` パーサーの WASM 対応（SERIKO アニメーション定義等を含む）とフォールバックの移行は完了。
  - **[TODO]**: `ui/ts/ghost/parser/` 配下のさくらスクリプト用 TS パーサー群（`ast.ts`, `tag-tokenizer.ts` 等）の依存を完全に剥がし、ディレクトリごと削除する。

### フェーズ 3: さくらスクリプト再生エンジンの WASM 移行 【🚧 進行中】
- **内容**: さくらスクリプトの再生・状態管理を Rust の `SakuraPlayerEngine` に委譲し、WASM が発行する `StepOutput` アクションによって UI を駆動する仕組みにする。
- **対応状況**:
  - `playScript` ロジックにおける `step()` ループとアクションディスパッチのブリッジ層は実装完了。
  - **[TODO]**: `ui/ts/ghost/sakura-play/` 配下に残存する複雑な TS イベントハンドラ（`handlers.ts` や同期処理など）の責務を整理・削除し、WASM エンジンのみを正と定めたシンプルなアーキテクチャに洗練する。

### フェーズ 4: SERIKO アニメーション & 画像合成エンジンの WASM 移行 【未着手】
- **内容**: サーフィスの画像合成（コンポジター）や、時間経過に伴うアニメーションのコマ送り進行ロジックを Rust に移行する。
- **[TODO]**:
  - `crates/nanai-core/src/seriko_animation.rs` と `surface_compositor.rs` を拡張し、TypeScript 側から「現在のミリ秒」を渡すだけで「描画すべきレイヤー状態」を返すようにする。
  - `ui/ts/surface/animation/` (タイマー・フレーム進行管理) および `ui/ts/surface/compositor/` (レイヤー合成計算) の TS ロジックを大幅に削除する。

### フェーズ 5: その他のコアドメイン (SSTP, FMO) の WASM 移行 【未着手】
- **内容**: SSTP プロトコルの構築・解析、FMO (File Mapping Object) データのパース等、通信とシステム状態に関する処理を WASM に移行する。
- **[TODO]**: 
  - `ui/ts/core/actions/sstp-fmo-actions.ts` の TS ロジックを、Rust の `sstp_fmo.rs` に完全移行。

---

## 検証と運用ポリシー
- **段階的移行**: 1つの機能（例えば 1つのパーサー）を WASM に移行するたびに、必ず `npm run test` (Vitest) を実行し、既存のテストケース（約1000件以上）が壊れていないことを確認する。
- **レガシーテストの移行**: TS 側の内部関数を検証していたテストは、WASM ブリッジ経由のブラックボックステスト、または Rust 側 (`cargo test`) の単体テストに書き換える。
- **型の安全性の保証**: 常に `npm run typecheck` を通し、WASM 由来の自動生成型とフロントエンドの型に不整合がない状態を維持する。