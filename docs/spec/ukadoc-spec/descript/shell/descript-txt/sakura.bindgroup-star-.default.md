# sakura.bindgroup\*.default,数値

- **規格**: [sakura.bindgroup-star-.default.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.bindgroup-star-.default/) (ukadoc-spec/descript/shell/descript-txt/sakura.bindgroup-star-.default.md)
- **検索語**: sakura.bindgroup
- **対応状況**: ✅ 実装済

## 突合結果

`crates/ui/src/descript/parser/queries.rs` (`bind_groups`) および `crates/ui/src/manifest/shell_manifest.rs` において `sakura.bindgroup*.default` のパースおよび初期着せ替え装着フラグバインド処理が完全実装済み。

## 実装箇所

- `crates/ui/src/descript/parser/queries.rs:129` `sakura.bindgroup`
- `crates/ui/src/manifest/shell_manifest.rs` (`sakura_bind_groups`)
