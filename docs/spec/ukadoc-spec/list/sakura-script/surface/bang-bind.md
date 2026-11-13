# \![bind,カテゴリ名,パーツ名,数値]

- **規格**: [bang-bind.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-bind/) (ukadoc-spec/list/sakura-script/surface/bang-bind.md)
- **検索語**: Bind
- **対応状況**: ✅ 実装済

## 突合結果

\\![bind,...] 着せ替え制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Bind)。

## 実装箇所

- `crates/nanai-surface/src/types/draw/interval.rs:32` `Bind,`
- `src-tauri/src/commands/shell/manifest.rs:121` `DrawMethod::Add | DrawMethod::Bind => "add".to_string(),`
- `ui/ts/ghost/sakura-rust-bridge.ts:113` `case "Bind":`
- `tests/sakura-rust-bridge.test.ts:24` `type: "Bind",`
- `crates/nanai-surface/src/types/draw/interval.rs:79` `"bind" => return Self::Bind,`
- `tests/sakura-rust-bridge.test.ts:28` `type: "Bind",`
