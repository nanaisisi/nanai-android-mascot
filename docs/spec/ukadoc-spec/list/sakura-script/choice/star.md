# \*

- **規格**: [star.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/star/) (ukadoc-spec/list/sakura-script/choice/star.md)
- **検索語**: \*
- **対応状況**: ✅ 実装済

## 突合結果

`\*` (Star) タグのパース処理および `SakuraCommand::Star` へのマッピングを実装 (`crates/ui/src/script/parser/mod.rs`)。

## 実装箇所

- `crates/ui/src/script/command.rs:36` `Star, // \*`
- `ui/js/surface/surface-load.js:8` `// [mousedown\*,当たり判定ID,ファイル名]`
- `ui/js/surface/surface-load.js:9` `// [mousehover\*,当たり判定ID,ファイル名]`
- `ui/js/surface/surface-load.js:10` `// [mouserightdown\*,当たり判定ID,ファイル名]`
- `ui/js/surface/surface-load.js:11` `// [mouseup\*,当たり判定ID,ファイル名]`
