# %property\[プロパティ名\]

- **規格**: [pct-property.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-property/) (ukadoc-spec/list/sakura-script/environment-variable/pct-property.md)
- **検索語**: property
- **対応状況**: 📝 コメントのみ(未実装の可能性大)

## 突合結果

実装コードに「property」が出現。実際の処理内容は未精査。

## 実装箇所

- `crates/ui/src/shiori/types/sender.rs:38` `"property" => Self::Property,`
- `crates/ui/src/shiori/types/sender.rs:53` `Self::Property => "property".into(),`
- `crates/ui/src/shiori/types/sender.rs:102` `("property", SenderTypeTag::Property),`
- `ui/main.js:16` `* @property {boolean} autoLoadGhost`
- `ui/main.js:17` `* @property {boolean} enableNotifications`
