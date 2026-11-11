# use_input_alpha,数値

- **規格**: [use_input_alpha.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/use_input_alpha.md)
- **検索語**: use_input_alpha
- **対応状況**: ✅ 実装済

## 突合結果

PNA マスク合成および Canvas 2D レンダラにおいてアルファチャンネル透過処理を完備。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:273` `props.use_input_alpha === "1" ||`
- `ui/ts/core/actions/balloon-descript/assets.ts:274` `props.use_input_alpha?.toLowerCase() === "true";`
- `tests/balloon-descript/all-properties/mock-props.ts:96` `use_input_alpha: "1",`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:133` `use_input_alpha: "1",`
