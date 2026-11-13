# always

- **規格**: [always.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always.md)
- **検索語**: always
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-core/src/seriko_animation.rs:19` `pub interval: String, // sometimes, rarely, always, runagain, bind, never`
- `ui/ts/surface/surface-animation-timers.ts:122` `if (kinds.has("always")) {`
- `ui/ts/ui/renderers/menu-caption-general.ts:36` `id: "always-stay-on-top-btn",`
- `tests/command-handler-window.test.ts:25` `it("sets always on top to true for stayontop", async () => {`
- `crates/nanai-core/src/seriko_animation.rs:49` `if def.interval == "runagain" || def.interval == "always" {`
- `ui/ts/ui/renderers/menu-caption-general.ts:42` `id: "always-tray-icon-visible-btn",`
