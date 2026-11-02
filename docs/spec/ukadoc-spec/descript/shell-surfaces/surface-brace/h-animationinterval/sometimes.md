# sometimes

- **規格**: [sometimes.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/sometimes/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/sometimes.md)
- **検索語**: sometimes
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/ui/src/surfaces/parser/mod.rs:254` `surface0 {\r\nname,SurfaceZero\r\ncollision0,0,0,10,10,Head\r\ncollisionex0,Face`
- `crates/ui/src/surfaces/parser/handlers/mod.rs:92` `apply_animation_line(&mut txt, &[0], "no_dot", "sometimes");`
- `crates/ui/src/surfaces/parser/handlers/mod.rs:93` `apply_animation_line(&mut txt, &[0], "abc.interval", "sometimes");`
- `crates/ui/src/surfaces/parser/handlers/mod.rs:94` `apply_animation_line(&mut txt, &[0], "0.interval", "sometimes");`
- `crates/ui/src/surfaces/types/draw.rs:65` `assert_eq!(Interval::parse("sometimes"), Interval::Sometimes);`
