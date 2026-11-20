# don't need bind,数値

- **規格**: [don-t-2.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/don-t-2.md)
- **検索語**: don't need bind
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `dont_need_bind()` において `don't need bind` ディレクティブのパースおよび評価が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:291` `self.get("don't need bind")`
