# \a

- **規格**: [a.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/a/) (ukadoc-spec/list/sakura-script/event/a.md)
- **検索語**: AudioWait
- **対応状況**: ✅ 実装済

## 突合結果

`\a` (AudioWait) コマンドのパース処理を実装 (`crates/ui/src/script/parser/mod.rs`)。

## 実装箇所

- `crates/ui/src/script/command.rs:38` `AudioWait, // \a`
- `crates/ui/src/script/parser/mod.rs:103` `Some('a') => callback(SakuraCommand::AudioWait), // \a`
