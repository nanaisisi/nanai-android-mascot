# uniqueid

- **規格**: [uniqueid.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/notify/uniqueid/) (ukadoc-spec/list/shiori-event/notify/uniqueid.md)
- **検索語**: uniqueid
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「uniqueid」を確認。

## 実装箇所

- `src-tauri/src/commands/shiori/protocol.rs:111` `/// `installedghostname` / `ghostpathlist` / `uniqueid` / `basewareversion` 等の`
- `ui/js/ghost/shiori-notify.js:14` `* - basewareversion / uniqueid`
- `ui/js/ghost/shiori-notify.js:94` `// uniqueid: ゴーストインストールディレクトリ名を自前IDとする`
- `ui/js/ghost/shiori-notify.js:100` `await this.sendShioriNotify("uniqueid", [dirName]);`
