# talk,数値

- **規格**: [talk.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/talk/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/talk.md)
- **検索語**: talk
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `src-tauri/src/commands/window/menu_native.rs:64` `.text("talk", "💬 もう一度話す (A)")`
- `crates/ui/src/animation.rs:227` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `crates/ui/src/surfaces/tests.rs:22` `assert_eq!(Interval::parse("talk"), Interval::Talk);`
- `crates/ui/src/surfaces/tests.rs:23` `assert_eq!(Interval::parse("starttalk"), Interval::StartTalk);`
- `crates/ui/src/surfaces/tests.rs:24` `assert_eq!(Interval::parse("endtalk"), Interval::EndTalk);`
