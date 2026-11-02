# endtalk

- **規格**: [endtalk.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/endtalk/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/endtalk.md)
- **検索語**: endtalk
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/ui/src/surfaces/types/draw.rs:72` `assert_eq!(Interval::parse("endtalk"), Interval::EndTalk);`
- `crates/ui/src/surfaces/types/draw.rs:240` `/// `endtalk`：発話終了時に1回`
- `crates/ui/src/surfaces/types/draw.rs:267` `"endtalk" => Self::EndTalk,`
- `crates/ui/src/animation/tests.rs:69` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `crates/ui/src/animation/tests.rs:300` `scheduler.on_talk_end(0, &anims); // 発話終了: endtalk発火`
