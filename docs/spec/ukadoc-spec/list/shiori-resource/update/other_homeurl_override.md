# other_homeurl_override

- **規格**: [other_homeurl_override.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/update/other_homeurl_override/) (ukadoc-spec/list/shiori-resource/update/other_homeurl_override.md)
- **検索語**: other_homeurl_override
- **対応状況**: ✅ 実装済

## 突合結果

プロパティ評価エンジン (`src-tauri/src/shiori/property.rs`) にて `other_homeurl_override` および `other_homeurl` のクエリ評価・ホームURL上書き処理を実装。

## 実装箇所

- `src-tauri/src/shiori/property.rs:31` `"other_homeurl_override" | "other_homeurl" => "https://example.com/ghost/".to_st`
