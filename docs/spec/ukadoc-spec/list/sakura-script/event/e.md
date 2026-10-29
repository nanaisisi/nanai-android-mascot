# \e

- **規格**: [e.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/e/) (ukadoc-spec/list/sakura-script/event/e.md)
- **検索語**: \e
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: スクリプト終了。


## 実装箇所

- `crates/ui/src/lib.rs:58` `let script = r"\0\s[0]こんにちは\w5\n\q[はい,id_yes]\e";`
- `crates/ui/src/animation.rs:227` `for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {`
- `crates/ui/src/script/command.rs:50` `End,          // \e`
- `crates/ui/src/surfaces/tests.rs:25` `assert_eq!(Interval::parse(r"\e"), Interval::YenE);`
- `crates/ui/src/surfaces/types/draw.rs:71` `/// `\e`（yen-e）：さくらスクリプト `\e` 到達時に強制実行`
