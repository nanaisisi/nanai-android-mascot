# start,ID

- **規格**: [start.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/start/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/start.md)
- **検索語**: start
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-core/src/surfaces_parser.rs:44` `&& let (Ok(start), Ok(end)) = (start_s.trim().parse::<u32>(), end_s.trim().parse`
- `src-tauri/src/shiori/headline.rs:43` `let start = s + start_tag.len();`
- `ui/ts/core/actions/dictation.ts:15` `start(): void;`
- `ui/css/balloon-window.css:260` `animation: clickwait-blink 1s steps(2, start) infinite;`
- `tests/async-parallel.test.ts:50` `const start = Date.now();`
- `crates/nanai-core/src/surfaces_parser.rs:46` `for i in start..=end {`
