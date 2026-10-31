# installedkeroname

- **規格**: [installedkeroname.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/notify/installedkeroname/) (ukadoc-spec/list/shiori-event/notify/installedkeroname.md)
- **検索語**: installedkeroname
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「installedkeroname」を確認。

## 実装箇所

- `ui/js/ghost/shiori-notify.js:11` `* - installedghostname / installedsakuraname / installedkeroname`
- `ui/js/ghost/shiori-notify.js:66` `await this.sendShioriNotify("installedkeroname", keroNames);`
- `tests/shiori-notify.test.js:60` `assert.ok(calls.some((c) => c.args.event === "installedkeroname"));`
