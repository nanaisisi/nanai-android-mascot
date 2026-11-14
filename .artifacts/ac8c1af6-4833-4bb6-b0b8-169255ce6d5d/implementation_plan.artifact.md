# インストール・プロトコル処理のWASM完全移行計画

NARアーカイブのインストール引数構築やエラー判定を行うフロントエンドの `ui/ts/core/actions/install-protocol.ts` に残るTS独自のフォールバック処理を廃し、既存のRust側コア（`crates/nanai-core/src/install_protocol.rs`）およびWASMバインディング経由の処理に完全に一本化します。

## 移行対象ファイル
- `ui/ts/core/actions/install-protocol.ts`
- `ui/ts/core/wasm/wasm-protocol.ts` (インストール関連バインディングの直接呼び出し強化)

## 移行の方針
1. **WASMファースト化**:
   - `install-protocol.ts` のエラー理由パースや引数構築関数が、WASMの `parseInstallErrorReasonWasm` 等を直接呼び出すようにクリーンアップ。
2. **冗長なTSロジックの削除**:
   - TS側に残っている重複したフォールバック実装を削除。
3. **検証**:
   - `cargo test -p nanai-core` および `npx vitest run` (特に `install-protocol` 関連テスト) の全パス確認。
