# starttalk

- **規格**: [starttalk.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/starttalk/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/starttalk.md)
- **検索語**: starttalk
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-surface/src/types/draw/interval.rs:81` `"starttalk" => return Self::StartTalk,`
- `crates/nanai-surface/src/types/draw/interval.rs:99` `"starttalk" => Self::StartTalk,`
- `crates/nanai-surface/src/types/draw/tests.rs:12` `assert_eq!(Interval::parse("starttalk"), Interval::StartTalk);`
- `crates/ui/src/animation/tests/timeline.rs:72` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
