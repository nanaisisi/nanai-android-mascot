# sometimes

- **規格**: [sometimes.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/sometimes/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/sometimes.md)
- **検索語**: sometimes
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/ui/src/animation/tests/timeline.rs:51` `assert!((Interval::parse("sometimes").fire_per_second().unwrap() - 0.1).abs() < `
- `crates/ui/src/surfaces/parser/tests.rs:18` `surface0 {\r\nname,SurfaceZero\r\ncollision0,0,0,10,10,Head\r\ncollisionex0,Face`
- `crates/ui/src/surfaces/parser/handlers/mod.rs:92` `apply_animation_line(&mut txt, &[0], "no_dot", "sometimes");`
- `crates/ui/src/surfaces/parser/handlers/mod.rs:93` `apply_animation_line(&mut txt, &[0], "abc.interval", "sometimes");`
- `crates/ui/src/surfaces/parser/handlers/mod.rs:94` `apply_animation_line(&mut txt, &[0], "0.interval", "sometimes");`
