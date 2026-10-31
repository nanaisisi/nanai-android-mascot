# username

- **規格**: [username.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/username/) (ukadoc-spec/list/shiori-resource/ghost/username.md)
- **検索語**: username
- **対応状況**: ✅ 対応済

## 突合結果

設定・SHIORIリクエスト/イベント時のユーザー名（username）取得・通知に対応。

## 実装箇所

- `src-tauri/src/shiori/property.rs:29` `"username" => "User".to_string(),`
- `src-tauri/src/shiori/property.rs:61` `assert_eq!(evaluate_property_query("username"), "User");`
