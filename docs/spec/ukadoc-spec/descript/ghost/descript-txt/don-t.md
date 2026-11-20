# don't need onmousemove,数値

- **規格**: [don-t.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/don-t.md)
- **検索語**: don't need onmousemove
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `dont_need_onmousemove()` において `don't need onmousemove` ディレクティブのパースおよび評価が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:284` `self.get("don't need onmousemove")`
