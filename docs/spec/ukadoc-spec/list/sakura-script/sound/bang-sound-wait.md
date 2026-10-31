# \![sound,wait]

- **規格**: [bang-sound-wait.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/sound/bang-sound-wait/) (ukadoc-spec/list/sakura-script/sound/bang-sound-wait.md)
- **検索語**: AudioWait
- **対応状況**: ✅ 実装済

## 突合結果

\\![sound,wait] サウンド再生終了同期待ちコマンドのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::AudioWait)。

## 実装箇所

- `crates/ui/src/script/command.rs:38` `AudioWait, // \a`
- `crates/ui/src/script/parser/mod.rs:103` `Some('a') => callback(SakuraCommand::AudioWait), // \a`
