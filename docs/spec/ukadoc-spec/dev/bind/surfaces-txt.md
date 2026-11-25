# surfaces.txtでの設定

- **規格**: [bind.md](../../../../ukadoc-spec/dev/bind.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/bind/))
- **検索語**: bindgroup
- **対応状況**: ⚠️ 一部対応

## 突合結果

surfaces.txt における着せ替えパーツ（bindgroup / animation）の定義・レイヤー合成に対応。

## 実装箇所

- `crates/ui/src/descript/parser/queries.rs:131` `let prefix = format!("{target}.bindgroup");`
