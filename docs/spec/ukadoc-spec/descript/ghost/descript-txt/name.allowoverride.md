# name.allowoverride,数値

- **規格**: [name.allowoverride.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/name.allowoverride.md)
- **検索語**: name.allowoverride
- **対応状況**: ✅ 実装済

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `is_name_allow_override()` において `name.allowoverride` フラグ（シェル側キャラクター名オーバーライド許可、既定値 `1`）のパースおよび評価が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`is_name_allow_override`)
