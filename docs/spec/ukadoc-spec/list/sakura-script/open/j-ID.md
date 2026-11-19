# \j[ID]

- **規格**: [j-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/j-ID/) (ukadoc-spec/list/sakura-script/open/j-ID.md)
- **検索語**: Jump
- **対応状況**: ✅ 実装済

## 突合結果

`\j[ID]` コマンドのパース (`crates/ui/src/script/parser/mod.rs` -> `SakuraCommand::Jump`), HTTP(S) URL, `file://` ファイルオープン, `mailto:` メーラー起動, および SHIORI イベントジャンプハンドリング (`ui/ts/ghost/command-handler/jump.ts`) が完全実装済み。

## 実装箇所

- `crates/ui/src/script/parser/mod.rs` (`Jump`)
- `ui/ts/ghost/command-handler/jump.ts` (`handleJumpCommand`)
