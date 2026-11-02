# starttalk

- **規格**: [starttalk.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/starttalk/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/starttalk.md)
- **検索語**: starttalk
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/ui/src/surfaces/types/draw.rs:71` `assert_eq!(Interval::parse("starttalk"), Interval::StartTalk);`
- `crates/ui/src/surfaces/types/draw.rs:238` `/// `starttalk`：発話開始時に1回`
- `crates/ui/src/surfaces/types/draw.rs:266` `"starttalk" => Self::StartTalk,`
- `crates/ui/src/animation/tests.rs:69` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `crates/ui/src/animation/tests.rs:292` `scheduler.on_char_spoken(0, &anims); // 1文字目: starttalk発火、talk,2は未発火`
