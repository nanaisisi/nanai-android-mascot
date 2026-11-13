# sometimes

- **規格**: [sometimes.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/sometimes/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/sometimes.md)
- **検索語**: sometimes
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-core/src/seriko_animation.rs:19` `pub interval: String, // sometimes, rarely, always, runagain, bind, never`
- `ui/ts/surface/animation-parser.ts:88` `const value = String(interval || "sometimes")`
- `tests/surface-parser.test.ts:43` `animation1.interval,sometimes`
- `crates/nanai-surface/src/parser/tests.rs:18` `surface0 {\r\nname,SurfaceZero\r\ncollision0,0,0,10,10,Head\r\ncollisionex0,Face`
- `ui/ts/surface/surface-animation-timers.ts:135` `if (kinds.has("sometimes")) probability = 0.5;`
- `tests/surface-parser.test.ts:58` `assert.equal(anim1.interval, "sometimes");`
