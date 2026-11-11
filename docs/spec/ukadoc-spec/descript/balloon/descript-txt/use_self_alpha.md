# use_self_alpha,値

- **規格**: [use_self_alpha.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/use_self_alpha.md)
- **検索語**: use_self_alpha
- **対応状況**: ✅ 実装済

## 突合結果

PNA マスク合成および Canvas 2D レンダラにおいてアルファチャンネル透過処理を完備。

## 実装箇所

- `crates/ui/src/descript/tests.rs:114` `let desc1 = Descript::parse("seriko.use_self_alpha,1\n");`
- `crates/ui/src/descript/tests.rs:117` `let desc2 = Descript::parse("seriko.use_self_alpha,true\n");`
- `crates/ui/src/descript/tests.rs:120` `let desc3 = Descript::parse("seriko.use_self_alpha,0\n");`
- `crates/ui/src/descript/parser/queries.rs:105` `self.get("seriko.use_self_alpha")`
- `ui/ts/core/actions/balloon-descript/assets.ts:267` `props.use_self_alpha === "1" ||`
