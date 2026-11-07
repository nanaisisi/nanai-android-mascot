# コードカバレッジ計測に関するドキュメント (Cargo-Tarpaulin)

現状、`cargo-llvm-cov` では `src-tauri` クレートの検出およびカバレッジ測定が正しく機能しないケースがあるため、本プロジェクトでは `cargo-tarpaulin` を用いたコードカバレッジ計測を推奨・サポートしています。

## 実行コマンド

バックエンド設定や不安定なブランチカバレッジを含めて実行するには、以下の環境変数を指定して `cargo-tarpaulin` を実行してください：

```bash
with-env { CARGO_UNSTABLE_CODEGEN_BACKEND: "true", CARGO_PROFILE_DEV_CODEGEN_BACKEND: "llvm" } { cargo tarpaulin --workspace -lb }
```

### パラメータ説明

- `--workspace`: ワークスペース内のすべてのクレート（`src-tauri`, `crates/ui` など）を対象に含めます。
- `-l` / `--line`: 行カバレッジ (Line coverage) を計測します。
- `-b` / `--branch`: ブランチカバレッジ (Branch coverage ※実験的/不安定) を計測します。
- 環境変数 `CARGO_UNSTABLE_CODEGEN_BACKEND` および `CARGO_PROFILE_DEV_CODEGEN_BACKEND` により、プロジェクト設定のコード生成バックエンド制約を回避してLLVMベースのカバレッジ計測を行います。
