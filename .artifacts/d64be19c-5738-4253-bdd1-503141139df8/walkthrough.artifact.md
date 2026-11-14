# Walkthrough - UKADOC/SSP 仕様対応の推進とレガシーTSパーサーの置き換え完了

UKADOC / SSP 仕様に基づく未対応機能（`\![...]` 拡張コマンド等のパース）を Rust / WASM 側に実装し、レガシーな TypeScript 製パーサーディレクトリ (`ui/ts/ghost/parser/`) を完全に排除しました。

## 変更内容

### 1. Rust / WASM 側でのコマンド拡張 (`sakura_script.rs`, `sakura_player.rs`)
- `\![...]` 形式の拡張コマンドタグのパース処理 (`SakuraToken::Command`) および再生ステップ出力 (`StepOutput::Command`) を実装しました。

### 2. ハイブリッド型 `sakura-tokenizer.ts` の導入
- WASM初期化済み環境では Rust の高速パーサーを使用し、未初期化のテスト環境等では堅牢な同期フォールバックとして機能するハイブリッド型トークナイザーを実装。これにより、約2,000行に及ぶ `ui/ts/ghost/parser/` のコードを完全に削除。

## 検証結果

- `npm run test` を実行し、**全 268 テストファイル / 1077 テストケースがすべて成功（Green）**することを確認しました。
