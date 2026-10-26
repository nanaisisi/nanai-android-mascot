# %second

- **規格**: [pct-second.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-second/) (ukadoc-spec/list/sakura-script/environment-variable/pct-second.md)
- **検索語**: second
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは無関係な語(変数名・URL 等)。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `ui/js/core/app-settings.js:57`  `let secondCounter = 0;`
- `ui/js/core/app-settings.js:67`  `secondCounter++;`
- `ui/js/core/app-settings.js:70`  `if (secondCounter % 60 === 0) {`
- `ui/js/core/app-settings.js:80`  `await invoke("on_second_change");`
- `ui/js/core/app-settings.js:84`  `} else if (secondCounter >= talkInterval) {`
