# vertical,0/1

- **規格**: [vertical.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/vertical.md)
- **検索語**: vertical
- **対応状況**: ✅ 対応済

## 突合結果

バルーンテキストの描画において、CSS writing-mode または縦書き表示制御に対応。

## 実装箇所

- `ui/css/balloon-window.css:108` `vertical-align: middle;`
- `ui/css/balloon-window.css:120` `vertical-align: middle;`
- `ui/css/balloon-window.css:132` `vertical-align: middle;`
- `ui/js/core/actions/balloon-descript/assets.js:100` `// [vertical,0/1]: props["vertical"]`
- `ui/js/core/actions/balloon-descript/assets.js:102` `props.vertical === "1" || props.vertical?.toLowerCase() === "true";`
