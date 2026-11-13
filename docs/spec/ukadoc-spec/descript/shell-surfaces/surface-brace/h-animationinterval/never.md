# never

- **規格**: [never.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/never/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/never.md)
- **検索語**: never
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-core/src/seriko_animation.rs:19` `pub interval: String, // sometimes, rarely, always, runagain, bind, never`
- `ui/ts/core/async-parallel.ts:166` `const timeoutPromise = new Promise<never>((_, reject) => {`
- `ui/ts/ui/submenu.ts:38` `let cachedBalloons: never[] = [];`
- `tests/async-parallel.test.ts:298` `const queuedPromise = pool.add(() => "never", {`
- `crates/nanai-core/src/seriko_animation.rs:84` `interval: "never".to_string(),`
- `ui/ts/surface/shell-manifest.ts:251` `interval: intervalToString(anim.interval) || "never",`
