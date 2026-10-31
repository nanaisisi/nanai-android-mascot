# \![raiseplugin]および\![notifyplugin]に指定された任意名イベント

- **規格**: [bang-raiseplugin-bang-notifyplugin.md](https://ukatech.shillest.net/ukadoc-spec/list/plugin-event/plugin-event/bang-raiseplugin-bang-notifyplugin/) (ukadoc-spec/list/plugin-event/plugin-event/bang-raiseplugin-bang-notifyplugin.md)
- **検索語**: raiseplugin
- **対応状況**: ✅ 実装済

## 突合結果

プラグイン向けイベント発行命令 (`raiseplugin`, `notifyplugin`) のパーサおよびディスパッチ処理の実装完了。

## 実装箇所

- `crates/ui/src/script/command.rs:50` `}, // \![raiseplugin,...] / \![notifyplugin,...]`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:22` `"raiseplugin" | "notifyplugin" | "timerraiseplugin" | "timernotifyplugin" => {`
- `ui/js/ghost/sakura-command-handler.js:42` `rawCmd === "raiseplugin" ||`
- `ui/js/ghost/sakura-command-handler.js:44` `rawCmd === "timerraiseplugin" ||`
