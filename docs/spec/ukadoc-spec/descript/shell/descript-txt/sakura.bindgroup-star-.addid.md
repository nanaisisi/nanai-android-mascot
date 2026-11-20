# sakura.bindgroup\*.addid,ID

- **規格**: [sakura.bindgroup-star-.addid.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.bindgroup-star-.addid/) (ukadoc-spec/descript/shell/descript-txt/sakura.bindgroup-star-.addid.md)
- **検索語**: sakura.bindgroup
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/ui/src/descript/parser/queries.rs` (`bind_groups`) および `crates/ui/src/manifest/shell_manifest.rs` において `sakura.bindgroup*.addid` のパースおよび着せ替え追加アニメーション ID バインド処理が完全実装済み。

## 実装箇所

- `crates/ui/src/descript/parser/queries.rs:129` `/// `[target].bindgroup[N].name/default/addid`（着せ替えパーツ定義: sakura.bindgroup, kero`
