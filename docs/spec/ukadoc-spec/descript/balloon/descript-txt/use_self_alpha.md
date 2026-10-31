# use_self_alpha,値

- **規格**: [use_self_alpha.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/use_self_alpha.md)
- **検索語**: use_self_alpha
- **対応状況**: ✅ 対応済

## 突合結果

PNA マスク合成および Canvas 2D レンダラにおいてアルファチャンネル透過処理を完備。

## 実装箇所

- `crates/ui/src/descript/parser.rs:134` `/// `seriko.use_self_alpha,1`（アルファチャンネル透過の有効化）`
- `crates/ui/src/descript/parser.rs:135` `pub fn seriko_use_self_alpha(&self) -> bool {`
- `crates/ui/src/descript/parser.rs:136` `self.get("seriko.use_self_alpha")`
- `ui/js/core/actions/balloon-descript/assets.js:150` `// [use_self_alpha,値]:`
- `ui/js/core/actions/balloon-descript/assets.js:152` `props.use_self_alpha === "1" ||`
