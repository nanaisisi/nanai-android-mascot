# kero.bindgroup\*.default,数値

- **規格**: [kero.bindgroup-star-.default.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.bindgroup-star-.default/) (ukadoc-spec/descript/shell/descript-txt/kero.bindgroup-star-.default.md)
- **検索語**: kero.bindgroup
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/ui/src/descript/parser/queries.rs` (`bind_groups`) および `crates/ui/src/manifest/shell_manifest.rs` において `kero.bindgroup*.default` のパースおよび初期着せ替え装着フラグバインド処理が完全実装済み。

## 実装箇所

- `crates/ui/src/descript/parser/queries.rs:129` `/// `[target].bindgroup[N].name/default/addid`（着せ替えパーツ定義: sakura.bindgroup, kero`
