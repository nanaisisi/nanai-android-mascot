# endtalk

- **規格**: [endtalk.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/endtalk/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/endtalk.md)
- **検索語**: endtalk
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「endtalk」を確認。


## 実装箇所

- `crates/ui/src/animation.rs:227` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `crates/ui/src/surfaces/tests.rs:24` `assert_eq!(Interval::parse("endtalk"), Interval::EndTalk);`
- `crates/ui/src/surfaces/types/draw.rs:69` `/// `endtalk`：発話終了時に1回`
- `crates/ui/src/surfaces/types/draw.rs:96` `"endtalk" => Self::EndTalk,`
- `ui/js/surface/surface-animation-manager.js:80` `!kinds.has("endtalk")`
