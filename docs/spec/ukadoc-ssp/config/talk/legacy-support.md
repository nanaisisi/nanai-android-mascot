# 旧仕様サポート - 通常は設定不要です

- **規格**: [talk.md](../../../../ukadoc-ssp/config/talk.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/talk/))
- **検索語**: talk, legacy
- **対応状況**: ✅ 実装済

## 突合結果

喋り/バルーンの旧仕様サポート設定は未実装。


## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:298` `self.get("don't need seriko talk")`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:180` `.and_then(|m| m.get("don't need seriko talk"))`
- `ui/ts/core/actions/menu-action-dispatcher.ts:114` `if (action === "talk") {`
- `ui/ts/ui/submenu-renderer.ts:433` `action: "talk-interval-ghost-choice",`
- `tests/app-actions.test.ts:61` `return "talk-result";`
- `crates/nanai-surface/src/types/draw/interval.rs:80` `"talk" => return Self::Talk,`
