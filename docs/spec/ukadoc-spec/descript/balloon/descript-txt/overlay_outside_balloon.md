# overlay_outside_balloon,数値

- **規格**: [overlay_outside_balloon.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/overlay_outside_balloon.md)
- **検索語**: overlay_outside_balloon
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript.js` にて `overlay_outside_balloon` プロパティをパースし、CSS 変数 `--balloon-overlay-outside` として動的適用を実装済み。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:282` `props.overlay_outside_balloon === "1" ||`
- `ui/ts/core/actions/balloon-descript/assets.ts:283` `props.overlay_outside_balloon?.toLowerCase() === "true";`
- `tests/balloon-descript/all-properties/mock-props.ts:97` `overlay_outside_balloon: "1",`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:134` `overlay_outside_balloon: "1",`
