# endtalk

- **規格**: [endtalk.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/endtalk/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/endtalk.md)
- **検索語**: endtalk
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-surface/src/types/draw/interval.rs:82` `"endtalk" => return Self::EndTalk,`
- `crates/nanai-surface/src/types/draw/interval.rs:100` `"endtalk" => Self::EndTalk,`
- `crates/nanai-surface/src/types/draw/tests.rs:13` `assert_eq!(Interval::parse("endtalk"), Interval::EndTalk);`
- `crates/ui/src/animation/tests/timeline.rs:72` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
