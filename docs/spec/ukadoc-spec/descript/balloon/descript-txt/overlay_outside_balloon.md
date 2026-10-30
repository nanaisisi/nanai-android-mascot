# overlay_outside_balloon,数値

- **規格**: [overlay_outside_balloon.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/overlay_outside_balloon.md)
- **検索語**: overlay_outside_balloon
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript.js` にて `overlay_outside_balloon` プロパティをパースし、CSS 変数 `--balloon-overlay-outside` として動的適用を実装済み。


## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:148` `// [overlay_outside_balloon,0/1]:`
- `ui/js/core/actions/balloon-descript/assets.js:150` `props.overlay_outside_balloon === "1" ||`
- `ui/js/core/actions/balloon-descript/assets.js:151` `props.overlay_outside_balloon?.toLowerCase() === "true";`
- `tests/balloon-descript.test.js:139` `overlay_outside_balloon: "1",`
