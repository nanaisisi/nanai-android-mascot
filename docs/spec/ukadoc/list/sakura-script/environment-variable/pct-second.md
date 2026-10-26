# %second

- **規格**: [pct-second.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-second/) (ukadoc-spec/list/sakura-script/environment-variable/pct-second.md)
- **検索語**: second
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「second」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-settings.js:57`  `let secondCounter = 0;`
- `ui/js/core/app-settings.js:67`  `secondCounter++;`
- `ui/js/core/app-settings.js:70`  `if (secondCounter % 60 === 0) {`
- `ui/js/core/app-settings.js:80`  `await invoke("on_second_change");`
- `ui/js/core/app-settings.js:84`  `} else if (secondCounter >= talkInterval) {`
