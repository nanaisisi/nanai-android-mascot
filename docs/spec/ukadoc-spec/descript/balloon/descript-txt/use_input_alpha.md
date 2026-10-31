# use_input_alpha,数値

- **規格**: [use_input_alpha.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/use_input_alpha.md)
- **検索語**: use_input_alpha
- **対応状況**: ✅ 対応済

## 突合結果

PNA マスク合成および Canvas 2D レンダラにおいてアルファチャンネル透過処理を完備。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:139` `// [use_input_alpha,数値]:`
- `ui/js/core/actions/balloon-descript/assets.js:141` `props.use_input_alpha === "1" ||`
- `ui/js/core/actions/balloon-descript/assets.js:142` `props.use_input_alpha?.toLowerCase() === "true";`
- `tests/balloon-descript.test.js:138` `use_input_alpha: "1",`
