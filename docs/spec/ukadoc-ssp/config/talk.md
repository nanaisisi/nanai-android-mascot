# 設定：喋り/バルーン

- **規格**: [config/talk.md](https://ukatech.shillest.net/ukadoc-ssp/config/talk/) (ukadoc-ssp/config/talk.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

自動トーク頻度設定、バルーン消去待ち時間

## 実装箇所

- `src-tauri/src/commands/window/menu_native.rs:76` `.text("talk", "💬 もう一度話す (A)")`
- `crates/ui/src/animation/scheduler/triggers.rs:140` `&& s.starts_with("talk,")`
- `crates/ui/src/animation/scheduler/triggers.rs:142` `let n: u32 = s.trim_start_matches("talk,").parse().unwrap_or(1);`
- `crates/ui/src/animation/tests/timeline.rs:59` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `crates/ui/src/animation/tests/scheduler/triggers_exclusive.rs:10` `interval: Some(Interval::Custom("talk,2".into())),`
