# stop,ID

- **規格**: [stop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/stop/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/stop.md)
- **検索語**: stop
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/ui/src/surfaces/types/draw.rs:32` `/// その他の拡張メソッド（`start`/`stop`/`import` 等）`
- `crates/ui/src/shiori/protocol/response/parse/tests.rs:128` `fn test_parse_stop_at_empty_line() {`
- `crates/ui/src/fmo/mod.rs:71` `/// ライフサイクルステートタグ ("active", "paused", "stopped")`
- `crates/ui/src/fmo/mod.rs:163` `if s == "paused" || s == "stopped" || s == "invisible" {`
- `crates/ui/src/animation/scheduler.rs:221` `self.stop_animations(scope_id);`
