# \&[ID]

- **規格**: [amp-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/amp-ID/) (ukadoc-spec/list/sakura-script/misc/amp-ID.md)
- **検索語**: \&[ID]
- **対応状況**: ✅ 実装済

## 突合結果

`\&[ID]` (エンティティ/特殊文字挿入: `\&[amp]`, `\&[lt]`, `\&[gt]`, `\&[ID]`) タグのパース処理を実装 (`crates/ui/src/script/parser/mod.rs`)。

## 実装箇所

- `crates/ui/src/script/parser/mod.rs:107` `// \&[ID] entity / property interpolation (\&[amp], \&[lt], \&[gt], \&[quot], \&`
