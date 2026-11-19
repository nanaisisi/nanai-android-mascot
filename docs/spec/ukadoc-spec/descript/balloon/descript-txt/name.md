# name,バルーン名

- **規格**: [name.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/name.md)
- **検索語**: name
- **対応状況**: ✅ 実装済

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `DescriptManifest::name()` により `descript.txt` の `name` プロパティを完全パース・取得可能。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`DescriptManifest#name`)
