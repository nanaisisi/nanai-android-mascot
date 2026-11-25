# descript.txtでの設定

- **規格**: [bind.md](../../../../ukadoc-spec/dev/bind.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/bind/))
- **検索語**: sakura.bindgroup
- **対応状況**: ⚠️ 一部対応

## 突合結果

descript.txt の bindgroup / bindoption 設定のパースおよびメニュー反映に対応。

## 実装箇所

- `crates/ui/src/descript/parser/queries.rs:129` `/// `[target].bindgroup[N].name/default/addid`（着せ替えパーツ定義: sakura.bindgroup, kero`
