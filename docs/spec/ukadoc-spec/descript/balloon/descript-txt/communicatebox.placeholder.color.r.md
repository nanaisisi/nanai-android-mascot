# communicatebox.placeholder.color.r,数値

- **規格**: [communicatebox.placeholder.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/)
- **検索語**: communicatebox.placeholder.color.r
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/core/actions/balloon-descript.js` の `rgbFromComponents` により `communicatebox.placeholder.color.r/g/b` を合成し、CSS 変数 `--communicatebox-placeholder-color` として動的適用を実装済み。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:9` `// [communicatebox.font.name,フォント名], [communicatebox.font.color.r/g/b,数値], [comm`
- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts:31` `props["communicatebox.placeholder.color.r"] ||`
