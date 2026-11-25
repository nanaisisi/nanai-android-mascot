# 複数のサーフェスで共通の設定をまとめる

- **規格**: [shell.md](../../../../ukadoc-spec/dev/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/shell/))
- **検索語**: surface.append
- **対応状況**: ⚠️ 一部対応

## 突合結果

複数サーフェスへの共通設定（surface.append 等）の適用に対応。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser/parser/header.rs:10` `let rest = if lower.starts_with("surface.append") {`
- `crates/nanai-core/src/surfaces_parser/parser/header.rs:11` `&trimmed["surface.append".len()..]`
- `crates/nanai-surface/src/parser/tests.rs:15` `surface.append.invalid {\r\n}\r\n\`
- `crates/nanai-surface/src/parser/helpers/blocks.rs:15` `/// `surface[N...]` / `surface.append[N...]` / `sakura.surface[N...]` ブロック`
- `crates/nanai-surface/src/parser/helpers/blocks.rs:35` `/// ブロック開始行（`surface[N]` / `surface.append[N]` / `*.surface.alias` / `descript` `
