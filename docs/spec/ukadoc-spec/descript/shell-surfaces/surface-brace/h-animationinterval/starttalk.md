# starttalk

- **規格**: [starttalk.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/starttalk/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/starttalk.md)
- **検索語**: starttalk
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「starttalk」を確認。


## 実装箇所

- `crates/ui/src/animation.rs:227` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `crates/ui/src/surfaces/tests.rs:23` `assert_eq!(Interval::parse("starttalk"), Interval::StartTalk);`
- `crates/ui/src/surfaces/types/draw.rs:67` `/// `starttalk`：発話開始時に1回`
- `crates/ui/src/surfaces/types/draw.rs:95` `"starttalk" => Self::StartTalk,`
- `ui/js/surface/surface-animation-manager.js:258` `this.triggerAnimations(scopeId, "starttalk");`
