# periodic,数値

- **規格**: [periodic.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic.md)
- **検索語**: periodic
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-surface/src/types/draw/interval.rs:68` `"periodic" => {`
- `ui/ts/surface/surface-animation-timers.ts:114` `if (kinds.has("periodic")) {`
- `tests/surface.test.ts:15` `const interval = parseInterval("periodic,5");`
- `crates/nanai-surface/src/types/draw/interval.rs:103` `"periodic" => Self::Periodic(param.and_then(|p| p.parse().ok()).unwrap_or(1000))`
- `tests/parser-fuzzing/cycle10-syntax-fuzzing.test.ts:50` `0pattern0,periodic,5,0,0,0`
- `crates/nanai-surface/src/types/draw/tests.rs:25` `Interval::parse("bind+periodic,500"),`
