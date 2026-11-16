# \__v[オプション]

- **規格**: [__v.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/__v/)
- **検索語**: \__v
- **対応状況**: ✅ 実装済

## 突合結果

`\__v[...]` (Voice) タグのパースおよびエンジン・フロントエンドにおける音声再生ルーティングを完全実装 (`crates/nanai-core/src/sakura_script/parser/extended_tags.rs` / `ui/ts/ghost/sakura-script.ts`)。


## 実装箇所

- `crates/nanai-core/src/sakura_script/types.rs` `Voice { path: String }`
- `crates/nanai-core/src/sakura_player.rs` `StepOutput::Voice { scope, path }`
- `crates/ui/src/script/command.rs:65` `Voice(String), // \__v[opt]`
- `ui/ts/ghost/sakura-script.ts` `case "Voice": ...`
