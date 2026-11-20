# \![*]

- **規格**: [bang-star.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/bang-star/) (ukadoc-spec/list/sakura-script/balloon-text/bang-star.md)
- **検索語**: \!
- **対応状況**: ✅ 実装済

## 突合結果

`\![*]` (選択肢マーカー/箇条書き記号タグ) のパース処理およびコマンドモデル `SakuraCommand::Marker` へのマッピング、フロントエンドブリッジでのトークン変換を実装済。

## 実装箇所

- `crates/ui/src/script/command.rs:77` `Marker,`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/mod.rs:48` `"*" => {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/settings/handlers.rs:121` `pub(crate) fn handle_marker(callback: &mut dyn FnMut(SakuraCommand)) {`
- `ui/ts/ghost/sakura-rust-bridge.ts:92` `| { type: "Marker"; payload?: undefined }`
- `ui/ts/ghost/sakura-rust-bridge.ts:376` `case "Marker":`
