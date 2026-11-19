# communicatebox.placeholder.color.g,数値

- **規格**: [communicatebox.placeholder.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/)
- **検索語**: communicatebox.placeholder.color.g
- **対応状況**: ✅ 実装済

## 突合結果

`ui/ts/core/actions/balloon-descript/layout/communicate-box.ts` の `rgbFromComponents` により `communicatebox.placeholder.color.r/g/b` を合成し、CSS 変数 `--communicatebox-placeholder-color` として動的適用を完全実装済み。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/layout/communicate-box.ts` (`applyCommunicateBoxProperties`)
