# char*.defaulty,Y座標

- **規格**: [char-star-.defaulty.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/char-star-.defaulty.md)
- **検索語**: char*.defaulty
- **対応状況**: ✅ 実装済

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `DescriptManifest::char_default_pos(index)` において `char{N}.defaulty` 座標キーのパースおよび取得が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`char_default_pos`)
