# talk,数値

- **規格**: [talk.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/talk/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/talk.md)
- **検索語**: talk
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `src-tauri/src/commands/window/menu_native.rs:76` `.text("talk", "💬 もう一度話す (A)")`
- `crates/ui/src/animation/scheduler/triggers.rs:140` `&& s.starts_with("talk,")`
- `crates/ui/src/animation/scheduler/triggers.rs:142` `let n: u32 = s.trim_start_matches("talk,").parse().unwrap_or(1);`
- `crates/ui/src/animation/tests/timeline.rs:59` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `crates/ui/src/animation/tests/scheduler/triggers_exclusive.rs:10` `interval: Some(Interval::Custom("talk,2".into())),`
