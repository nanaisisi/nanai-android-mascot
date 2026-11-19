# kero.bindgroup\*.addid,ID

- **規格**: [kero.bindgroup-star-.addid.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.bindgroup-star-.addid/) (ukadoc-spec/descript/shell/descript-txt/kero.bindgroup-star-.addid.md)
- **検索語**: kero.bindgroup
- **対応状況**: ✅ 実装済

## 突合結果

`crates/ui/src/descript/parser/queries.rs` (`bind_groups`) および `crates/ui/src/manifest/shell_manifest.rs` において `kero.bindgroup*.addid` のパースおよび着せ替え追加アニメーション ID バインド処理が完全実装済み。

## 実装箇所

- `crates/ui/src/descript/parser/queries.rs:129` `kero.bindgroup`
- `crates/ui/src/manifest/shell_manifest.rs` (`kero_bind_groups`)
